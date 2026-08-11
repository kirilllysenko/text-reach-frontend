import type { DatagridCore } from "../index.svelte";
import type { DataTableCursor, DataTablePageDirection, DataTablePageRequest } from "./pagination.svelte";
import type { DataTableFilter } from "./column-filtering.svelte";
import type { DataTableSort } from "./sorting.svelte";
import type { EventPayloadMap, OnPageChangePayload } from "../services/event-service";

export interface DataTableLoadRequest<TSort = DataTableSort, TFilter = DataTableFilter> {
  cursor: DataTableCursor;
  direction?: DataTablePageDirection;
  filters: TFilter[];
  limit: number;
  offset?: number;
  page?: number;
  signal?: AbortSignal;
  sorts: TSort[];
}

export interface DataTableLoadResult<TData> {
  nextCursor: DataTableCursor;
  previousCursor?: DataTableCursor;
  rows: TData[];
  totalRows: number;
}

export type DataTableLoadReason =
  | "filtering"
  | "initial"
  | "pagination"
  | "pagination-size"
  | "reload"
  | "search"
  | "sorting";

export type DataTableLoader<TData, TSort = DataTableSort, TFilter = DataTableFilter> = (
  request: DataTableLoadRequest<TSort, TFilter>,
) => DataTableLoadResult<TData> | Promise<DataTableLoadResult<TData>>;

/**
 * Runtime state and configuration for server-backed table rows.
 *
 * DataLoadingFeature does not own pagination, filtering, sorting, or search state.
 * It listens to pagination and search events, builds a DataTableLoadRequest,
 * calls the configured loader, and applies the returned rows back to the table.
 */
export type DataLoadingFeatureState<TOriginalRow = any, TSort = DataTableSort, TFilter = DataTableFilter> = {
  /** Whether the feature should subscribe to table events and allow loads. */
  enabled: boolean;

  /** Last user-facing load error. Cleared before each new load attempt. */
  error: string | null;

  /**
   * User-provided function that fetches one page of rows.
   *
   * The loader receives the current page request and AbortSignal. It returns
   * display-ready rows plus pagination cursor metadata.
   */
  loader: DataTableLoader<TOriginalRow, TSort, TFilter> | null;

  /** Whether a load is currently in progress. */
  loading: boolean;

  /** Whether start() should immediately load the first page. */
  loadOnStart: boolean;

  /**
   * Whether local table processors should be switched to manual mode.
   *
   * Leave this enabled for backend-loaded tables so server results are not sorted,
   * filtered, searched, or paginated again on the client.
   */
  manualFeatures: boolean;

  /** Called after a loader failure that belongs to the current request. */
  onLoadError: (error: unknown, request: DataTableLoadRequest<TSort, TFilter>, reason: DataTableLoadReason) => void;

  /** Called immediately before the loader runs. */
  onLoadStart: (request: DataTableLoadRequest<TSort, TFilter>, reason: DataTableLoadReason) => void;

  /** Called after a successful current request has been applied to the table. */
  onLoadSuccess: (
    result: DataTableLoadResult<TOriginalRow>,
    request: DataTableLoadRequest<TSort, TFilter>,
    reason: DataTableLoadReason,
  ) => void;
};

/**
 * Partial configuration accepted by DatagridCore initialState.dataLoading.
 */
export type DataLoadingFeatureConfig<TOriginalRow = any, TSort = DataTableSort, TFilter = DataTableFilter> = Partial<
  DataLoadingFeatureState<TOriginalRow, TSort, TFilter>
>;

/**
 * Coordinates server-backed data loading for a table.
 *
 * Responsibilities:
 * - subscribe to pagination and search events
 * - build DataTableLoadRequest from current pagination state
 * - abort the previous request when a newer request starts
 * - replace table rows with the loader result
 * - register cursor and total-row metadata with PaginationFeature
 *
 * It intentionally does not expose page navigation helpers. Use PaginationService
 * for movement; this feature reacts to that movement and fetches the right data.
 */
export class DataLoadingFeature<
  TOriginalRow = any,
  TSort = DataTableSort,
  TFilter = DataTableFilter,
> implements DataLoadingFeatureState<TOriginalRow, TSort, TFilter> {
  /** The table instance this feature coordinates. */
  datagrid: DatagridCore<TOriginalRow, TSort, TFilter>;

  enabled = $state(false);
  error = $state<string | null>(null);
  loading = $state(false);

  loader: DataTableLoader<TOriginalRow, TSort, TFilter> | null = null;
  loadOnStart = true;
  manualFeatures = true;

  /** Last request sent to the loader, useful for debugging and tests. */
  lastRequest = $state.raw<DataTableLoadRequest<TSort, TFilter> | null>(null);

  /** Last successful loader result, useful for debugging and tests. */
  lastResult = $state.raw<DataTableLoadResult<TOriginalRow> | null>(null);

  onLoadError: (error: unknown, request: DataTableLoadRequest<TSort, TFilter>, reason: DataTableLoadReason) => void =
    () => {};
  onLoadStart: (request: DataTableLoadRequest<TSort, TFilter>, reason: DataTableLoadReason) => void = () => {};
  onLoadSuccess: (
    result: DataTableLoadResult<TOriginalRow>,
    request: DataTableLoadRequest<TSort, TFilter>,
    reason: DataTableLoadReason,
  ) => void = () => {};

  private abortController: AbortController | null = null;
  private connected = false;
  private pageChange: OnPageChangePayload | null = null;
  private requestSequence = 0;
  private unsubscribers: (() => void)[] = [];

  /**
   * Creates the feature. Passing a loader enables it by default.
   */
  constructor(
    datagrid: DatagridCore<TOriginalRow, TSort, TFilter>,
    config?: DataLoadingFeatureConfig<TOriginalRow, TSort, TFilter>,
  ) {
    this.datagrid = datagrid;
    Object.assign(this, config);
    this.enabled = config?.enabled ?? Boolean(config?.loader);
  }

  /**
   * Subscribes to table feature events and optionally loads the first page.
   *
   * Calling start more than once is safe. Without a loader, start is a no-op.
   */
  start(): void {
    if (this.connected || !this.enabled || !this.loader) {
      return;
    }

    this.connected = true;
    this.applyManualFeatureMode();
    this.unsubscribers = [
      this.subscribe("onPageChange", this.handlePageChange),
      this.subscribe("onPageSizeChange", () => {
        void this.reload("pagination-size");
      }),
      this.subscribe("onSearchQueryChange", () => {
        void this.reload("search");
      }),
      this.subscribe("onFilterChange", () => {
        void this.reload("filtering");
      }),
      this.subscribe("onSortingChange", () => {
        void this.reload("sorting");
      }),
    ];

    if (this.loadOnStart) {
      void this.load("initial");
    }
  }

  /**
   * Unsubscribes from table feature events without aborting an in-flight request.
   */
  stop(): void {
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
    this.unsubscribers = [];
    this.connected = false;
  }

  /**
   * Fully tears down the feature subscriptions and aborts any in-flight request.
   */
  dispose(): void {
    this.stop();
    this.abortController?.abort();
    this.abortController = null;
  }

  /**
   * Resets cursor history to page one and loads the first page.
   *
   * Use this when external route state changes, such as a search input that lives
   * outside the shared table feature state.
   */
  async reload(reason: DataTableLoadReason = "reload"): Promise<DataTableLoadResult<TOriginalRow> | null> {
    this.datagrid.features.pagination.resetCursors();
    return this.load(reason);
  }

  /**
   * Executes one load for the current pagination state.
   *
   * A newer load aborts and supersedes an older one. Stale responses are ignored
   * so fast user interactions cannot apply rows from an outdated request.
   */
  async load(reason: DataTableLoadReason = "reload"): Promise<DataTableLoadResult<TOriginalRow> | null> {
    if (!this.enabled || !this.loader) {
      return null;
    }

    const requestId = this.requestSequence + 1;
    this.requestSequence = requestId;

    this.abortController?.abort();
    this.abortController = new AbortController();

    const request = this.buildLoadRequest(this.getPageRequest(reason), this.abortController.signal);
    this.loading = true;
    this.error = null;
    this.lastRequest = request;
    this.onLoadStart(request, reason);

    try {
      const result = await this.loader(request);

      if (requestId !== this.requestSequence || this.abortController.signal.aborted) {
        return null;
      }

      this.datagrid.replaceData(result.rows);
      this.datagrid.features.pagination.registerLoadResult(request, result);
      this.lastResult = result;
      this.onLoadSuccess(result, request, reason);

      return result;
    } catch (error) {
      if (requestId !== this.requestSequence || this.abortController.signal.aborted) {
        return null;
      }

      this.error = this.getErrorMessage(error);
      this.onLoadError(error, request, reason);
      return null;
    } finally {
      if (requestId === this.requestSequence) {
        this.loading = false;
      }
    }
  }

  /**
   * Builds the loader request from the current pagination state.
   */
  buildLoadRequest(pageRequest = this.datagrid.features.pagination.getCurrentPageRequest(), signal?: AbortSignal) {
    return {
      cursor: pageRequest.cursor,
      direction: pageRequest.direction,
      filters: this.datagrid.features.filtering.filters,
      limit: pageRequest.limit,
      ...(typeof pageRequest.offset === "number" ? { offset: pageRequest.offset } : {}),
      page: pageRequest.page,
      signal,
      sorts: this.datagrid.features.sorting.sorts,
    } satisfies DataTableLoadRequest<TSort, TFilter>;
  }

  private applyManualFeatureMode(): void {
    if (!this.manualFeatures) {
      return;
    }

    this.datagrid.features.pagination.manual = true;
    this.datagrid.features.sorting.isManual = true;
    this.datagrid.features.filtering.isManual = true;
    this.datagrid.features.globalSearch.isManual = true;
  }

  private handlePageChange = ({ prevPage, newPage }: OnPageChangePayload): void => {
    this.pageChange = { prevPage, newPage };
    void this.load("pagination");
  };

  private getPageRequest(reason: DataTableLoadReason): DataTablePageRequest {
    const pageChange = this.pageChange;
    this.pageChange = null;

    if (reason === "pagination" && pageChange) {
      return this.datagrid.features.pagination.getPageChangeRequest(pageChange.prevPage, pageChange.newPage);
    }

    return this.datagrid.features.pagination.getCurrentPageRequest();
  }

  private subscribe<TEvent extends keyof EventPayloadMap>(
    event: TEvent,
    callback: (payload: EventPayloadMap[TEvent]) => void,
  ): () => void {
    this.datagrid.events.on(event, callback);
    return () => this.datagrid.events.off(event, callback);
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === "string") {
      return error;
    }

    return "Could not load table data.";
  }
}
