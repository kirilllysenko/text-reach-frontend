import { EventService } from "./events";
import { ColumnsFeature } from "./features/columns.svelte";
import { FiltersFeature } from "./features/filters.svelte";
import { InfiniteLoader } from "./features/infinite-loader.svelte";
import { RowsFeature } from "./features/rows.svelte";
import { SortingFeature } from "./features/sorting.svelte";
import { VirtualWindowFeature } from "./features/virtual-window.svelte";
import type { DataTableColumnDef } from "./columns";
import type { DataTableFilter } from "./features/filters.svelte";
import type { DataTableLoadRequest, DataTableLoadResult } from "./features/infinite-loader.svelte";
import type { DataTableInfiniteOptions } from "./features/virtual-window.svelte";

export interface DataTableOptions<TData, TMeta = unknown> {
  columns: DataTableColumnDef<TData, TMeta>[];
  emptyLabel?: string;
  errorLabel?: string;
  filters?: DataTableFilter[];
  getRowId?: (row: TData, index: number) => string;
  infinite?: DataTableInfiniteOptions;
  loadRows: (request: DataTableLoadRequest) => Promise<DataTableLoadResult<TData>>;
  pageSize: number;
}

export class DataTable<TData, TMeta = unknown> {
  readonly events = new EventService();
  readonly rows = new RowsFeature<TData>();
  readonly columns: ColumnsFeature<TData, TMeta>;
  readonly filters: FiltersFeature;
  readonly loader: InfiniteLoader<TData, TMeta>;
  readonly sorting: SortingFeature;
  readonly virtual: VirtualWindowFeature;
  private readonly eventDisposers: (() => void)[];

  constructor(readonly options: DataTableOptions<TData, TMeta>) {
    this.columns = new ColumnsFeature(options.columns, this.events);
    this.sorting = new SortingFeature(this.events);
    this.filters = new FiltersFeature(options.filters, this.events);
    this.loader = new InfiniteLoader({
      events: this.events,
      filters: this.filters,
      options,
      rows: this.rows,
      sorting: this.sorting,
    });
    this.virtual = new VirtualWindowFeature({
      events: this.events,
      getRowCount: () => this.rows.loadedCount,
      threshold: options.infinite?.threshold ?? 15,
    });
    this.eventDisposers = [
      this.events.on("filterChange", () => void this.reload()),
      this.events.on("nearEnd", () => void this.loadMore()),
      this.events.on("sortChange", () => void this.reload()),
    ];
  }

  get statusLabel(): string {
    const totalRows = this.rows.totalRows;
    return totalRows === null ? `${this.rows.loadedCount} loaded` : `${this.rows.loadedCount} of ${totalRows} loaded`;
  }

  get visibleColumns() {
    return this.columns.visible;
  }

  get visibleRows() {
    return this.rows.items;
  }

  dispose = (): void => {
    this.eventDisposers.forEach((dispose) => dispose());
    this.loader.dispose();
  };
  loadInitial = (): Promise<void> => this.loader.loadInitial();
  loadMore = (): Promise<void> => this.loader.loadMore();
  reload = (): Promise<void> => this.loader.reload();
}
