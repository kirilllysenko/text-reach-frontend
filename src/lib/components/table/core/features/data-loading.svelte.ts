import type { DatagridCore } from "../index.svelte";
import type {
  DataTableLoadReason,
  DataTableLoadRequest,
  DataTableLoadResult,
  DataTableLoader,
  DataTablePageRequest,
  EventPayloadMap,
  OnPageChangePayload,
} from "../types";

/**
 * Runtime state and configuration for server-backed table rows.
 *
 * DataLoadingFeature does not own pagination, filtering, sorting, or search state.
 * It listens to pagination and search events, builds a DataTableLoadRequest,
 * calls the configured loader, and applies the returned rows back to the table.
 */
export type DataLoadingFeatureState<TOriginalRow = any, TSortId extends string = string> = {
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
  loader: DataTableLoader<TOriginalRow, TSortId> | null;

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
  onLoadError: (error: unknown, request: DataTableLoadRequest<TSortId>, reason: DataTableLoadReason) => void;

  /** Called immediately before the loader runs. */
  onLoadStart: (request: DataTableLoadRequest<TSortId>, reason: DataTableLoadReason) => void;

  /** Called after a successful current request has been applied to the table. */
  onLoadSuccess: (
    result: DataTableLoadResult<TOriginalRow>,
    request: DataTableLoadRequest<TSortId>,
    reason: DataTableLoadReason,
  ) => void;
};

/**
 * Partial configuration accepted by DatagridCore initialState.dataLoading.
 */
export type DataLoadingFeatureConfig<TOriginalRow = any, TSortId extends string = string> = Partial<
  DataLoadingFeatureState<TOriginalRow, TSortId>
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
export class DataLoadingFeature<TOriginalRow = any, TSortId extends string = string>
  implements DataLoadingFeatureState<TOriginalRow, TSortId>
{
  /** The table instance this feature coordinates. */
  datagrid: DatagridCore<TOriginalRow, any, TSortId>;

  enabled = $state(false);
  error = $state<string | null>(null);
  loading = $state(false);

  loader: DataTableLoader<TOriginalRow, TSortId> | null = null;
  loadOnStart = true;
  manualFeatures = true;

  /** Last request sent to the loader, useful for debugging and tests. */
  lastRequest = $state.raw<DataTableLoadRequest<TSortId> | null>(null);

  /** Last successful loader result, useful for debugging and tests. */
  lastResult = $state.raw<DataTableLoadResult<TOriginalRow> | null>(null);

  onLoadError: (error: unknown, request: DataTableLoadRequest<TSortId>, reason: DataTableLoadReason) => void = () => {};
  onLoadStart: (request: DataTableLoadRequest<TSortId>, reason: DataTableLoadReason) => void = () => {};
  onLoadSuccess: (
    result: DataTableLoadResult<TOriginalRow>,
    request: DataTableLoadRequest<TSortId>,
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
    datagrid: DatagridCore<TOriginalRow, any, TSortId>,
    config?: DataLoadingFeatureConfig<TOriginalRow, TSortId>,
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
    } satisfies DataTableLoadRequest<TSortId>;
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
