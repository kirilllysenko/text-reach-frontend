import type { EventService } from "../events";
import type { DataTableFilter } from "./filters.svelte";
import type { DataTableCursor } from "./rows.svelte";
import type { DataTableSort } from "./sorting.svelte";
import type { DataTableCore, DataTableFeature } from "../data-table.svelte";
import type { RowsFeature } from "./rows.svelte";

export interface DataTableLoadRequest {
  cursor: DataTableCursor;
  filters: DataTableFilter[];
  limit: number;
  signal: AbortSignal;
  sorting: DataTableSort[];
}

export interface DataTableLoadResult<TData> {
  nextCursor: DataTableCursor;
  rows: TData[];
  totalRows?: number;
}

export interface InfiniteLoaderFeatureOptions<TData> {
  loadRows: (request: DataTableLoadRequest) => Promise<DataTableLoadResult<TData>>;
  pageSize: number;
}

export interface InfiniteLoaderFeatureApi<TData> {
  loader: InfiniteLoader<TData>;
  loadInitial: () => Promise<void>;
  loadMore: () => Promise<void>;
  reload: () => Promise<void>;
}

interface InfiniteLoaderOptions<TData> {
  events: EventService;
  getFilters: () => DataTableFilter[];
  getSorting: () => DataTableSort[];
  loadRows: (request: DataTableLoadRequest) => Promise<DataTableLoadResult<TData>>;
  pageSize: number;
  rows: RowsFeature<TData>;
}

interface LoaderFeatureDependencies {
  filters?: {
    filters: DataTableFilter[];
  };
  sorting?: {
    sorts: DataTableSort[];
  };
}

export class InfiniteLoader<TData> {
  error = $state<string | null>(null);
  loadingInitial = $state(false);
  loadingMore = $state(false);
  private activeAbortController: AbortController | null = null;

  constructor(private readonly options: InfiniteLoaderOptions<TData>) {}

  abort(): void {
    this.activeAbortController?.abort();
    this.activeAbortController = null;
  }

  dispose(): void {
    this.abort();
  }

  async loadInitial(): Promise<void> {
    if (this.loadingInitial) {
      return;
    }

    this.abort();
    this.options.rows.reset();
    this.error = null;
    this.loadingInitial = true;
    this.options.events.emit("loadInitialStart", undefined);

    const abortController = new AbortController();
    this.activeAbortController = abortController;

    try {
      const result = await this.options.loadRows({
        cursor: null,
        filters: this.options.getFilters(),
        limit: this.options.pageSize,
        signal: abortController.signal,
        sorting: this.options.getSorting(),
      });

      this.options.rows.set(result.rows, result.nextCursor, result.totalRows);
      this.options.events.emit("loadInitialSuccess", undefined);
    } catch (error) {
      if (!abortController.signal.aborted) {
        this.error = error instanceof Error ? error.message : "Could not load rows.";
        this.options.events.emit("loadError", { error: this.error });
      }
    } finally {
      if (this.activeAbortController === abortController) {
        this.activeAbortController = null;
      }

      this.loadingInitial = false;
    }
  }

  async loadMore(): Promise<void> {
    if (this.loadingInitial || this.loadingMore || !this.options.rows.hasMore) {
      return;
    }

    this.error = null;
    this.loadingMore = true;
    this.options.events.emit("loadMoreStart", undefined);
    const abortController = new AbortController();
    this.activeAbortController = abortController;

    try {
      const result = await this.options.loadRows({
        cursor: this.options.rows.nextCursor,
        filters: this.options.getFilters(),
        limit: this.options.pageSize,
        signal: abortController.signal,
        sorting: this.options.getSorting(),
      });

      this.options.rows.append(result.rows, result.nextCursor, result.totalRows);
      this.options.events.emit("loadMoreSuccess", undefined);
    } catch (error) {
      if (!abortController.signal.aborted) {
        this.error = error instanceof Error ? error.message : "Could not load rows.";
        this.options.events.emit("loadError", { error: this.error });
      }
    } finally {
      if (this.activeAbortController === abortController) {
        this.activeAbortController = null;
      }

      this.loadingMore = false;
    }
  }

  async reload(): Promise<void> {
    await this.loadInitial();
  }
}

export function infiniteLoaderFeature<TData>(
  options: InfiniteLoaderFeatureOptions<TData>,
): DataTableFeature<InfiniteLoaderFeatureApi<TData>> {
  return {
    dependencies: [],
    id: "infiniteLoader",
    install(table) {
      const typedTable = table as unknown as DataTableCore<TData> & LoaderFeatureDependencies;
      const loader = new InfiniteLoader<TData>({
        events: typedTable.events,
        getFilters: () => typedTable.filters?.filters ?? [],
        getSorting: () => typedTable.sorting?.sorts ?? [],
        loadRows: options.loadRows,
        pageSize: options.pageSize,
        rows: typedTable.rows,
      });

      typedTable.addDisposer(typedTable.events.on("filterChange", () => void loader.reload()));
      typedTable.addDisposer(typedTable.events.on("nearEnd", () => void loader.loadMore()));
      typedTable.addDisposer(typedTable.events.on("sortChange", () => void loader.reload()));
      typedTable.addDisposer(() => loader.dispose());

      return {
        loader,
        loadInitial: () => loader.loadInitial(),
        loadMore: () => loader.loadMore(),
        reload: () => loader.reload(),
      };
    },
  };
}
