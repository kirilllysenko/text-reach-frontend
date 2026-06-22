import type { DataTableCore } from "./data-table.svelte";
import type { ColumnsFeature } from "./features/columns.svelte";
import type { FiltersFeature } from "./features/filters.svelte";
import type { InfiniteLoader } from "./features/infinite-loader.svelte";
import type { SortingFeature } from "./features/sorting.svelte";
import type { VirtualWindowFeature } from "./features/virtual-window.svelte";

export interface RenderedTableFeatures<TData, TMeta> {
  columns: ColumnsFeature<TData, TMeta>;
  filters: FiltersFeature;
  loader: InfiniteLoader<TData>;
  loadInitial: () => Promise<void>;
  loadMore: () => Promise<void>;
  reload: () => Promise<void>;
  sorting: SortingFeature;
  virtual: VirtualWindowFeature;
}

export type DataTable<TData, TMeta = unknown> = DataTableCore<TData, TMeta> & RenderedTableFeatures<TData, TMeta>;
