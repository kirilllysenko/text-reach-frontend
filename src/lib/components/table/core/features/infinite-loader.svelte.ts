import type { RowsFeature } from "./rows.svelte";
import type { SortingFeature } from "./sorting.svelte";
import type { FiltersFeature } from "./filters.svelte";
import type { EventService } from "../events";
import type { DataTableFilter } from "./filters.svelte";
import type { DataTableCursor } from "./rows.svelte";
import type { DataTableSort } from "./sorting.svelte";

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

interface InfiniteLoaderTableOptions<TData> {
  errorLabel?: string;
  loadRows: (request: DataTableLoadRequest) => Promise<DataTableLoadResult<TData>>;
  pageSize: number;
}

interface InfiniteLoaderOptions<TData, TMeta> {
  events: EventService;
  filters: FiltersFeature;
  options: InfiniteLoaderTableOptions<TData>;
  rows: RowsFeature<TData>;
  sorting: SortingFeature;
}

export class InfiniteLoader<TData, TMeta = unknown> {
  error = $state<string | null>(null);
  loadingInitial = $state(false);
  loadingMore = $state(false);
  private activeAbortController: AbortController | null = null;

  constructor(private readonly config: InfiniteLoaderOptions<TData, TMeta>) {}

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
    this.config.rows.reset();
    this.error = null;
    this.loadingInitial = true;
    this.config.events.emit("loadInitialStart", undefined);

    const abortController = new AbortController();
    this.activeAbortController = abortController;

    try {
      const result = await this.config.options.loadRows({
        cursor: null,
        filters: this.config.filters.value,
        limit: this.config.options.pageSize,
        signal: abortController.signal,
        sorting: this.config.sorting.sorts,
      });

      this.config.rows.set(result.rows, result.nextCursor, result.totalRows);
      this.config.events.emit("loadInitialSuccess", undefined);
    } catch (error) {
      if (!abortController.signal.aborted) {
        this.error =
          error instanceof Error ? error.message : (this.config.options.errorLabel ?? "Could not load rows.");
        this.config.events.emit("loadError", { error: this.error });
      }
    } finally {
      if (this.activeAbortController === abortController) {
        this.activeAbortController = null;
      }

      this.loadingInitial = false;
    }
  }

  async loadMore(): Promise<void> {
    if (this.loadingInitial || this.loadingMore || !this.config.rows.hasMore) {
      return;
    }

    this.error = null;
    this.loadingMore = true;
    this.config.events.emit("loadMoreStart", undefined);
    const abortController = new AbortController();
    this.activeAbortController = abortController;

    try {
      const result = await this.config.options.loadRows({
        cursor: this.config.rows.nextCursor,
        filters: this.config.filters.value,
        limit: this.config.options.pageSize,
        signal: abortController.signal,
        sorting: this.config.sorting.sorts,
      });

      this.config.rows.append(result.rows, result.nextCursor, result.totalRows);
      this.config.events.emit("loadMoreSuccess", undefined);
    } catch (error) {
      if (!abortController.signal.aborted) {
        this.error =
          error instanceof Error ? error.message : (this.config.options.errorLabel ?? "Could not load rows.");
        this.config.events.emit("loadError", { error: this.error });
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
