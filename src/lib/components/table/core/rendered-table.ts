import type { DataTableCore } from "./data-table.svelte";
import type { ColumnFeature } from "./features/column.svelte";
import type { ColumnOrderFeature } from "./features/column-order.svelte";
import type { ColumnVisibilityFeature } from "./features/column-visibility.svelte";
import type { FiltersFeature } from "./features/filters.svelte";
import type { InfiniteLoader } from "./features/infinite-loader.svelte";
import type { SortingFeature } from "./features/sorting.svelte";
import type { VirtualWindowFeature } from "./features/virtual-window.svelte";

export interface RenderedTableFeatures<TData, TMeta> {
  column: ColumnFeature<TData, TMeta>;
  columnOrder: ColumnOrderFeature<TData, TMeta>;
  columnVisibility: ColumnVisibilityFeature;
  filters: FiltersFeature;
  loader: InfiniteLoader<TData>;
  loadInitial: () => Promise<void>;
  loadMore: () => Promise<void>;
  reload: () => Promise<void>;
  sorting: SortingFeature;
  virtual: VirtualWindowFeature;
}

export type DataTable<TData, TMeta = unknown> = DataTableCore<TData, TMeta> & RenderedTableFeatures<TData, TMeta>;
