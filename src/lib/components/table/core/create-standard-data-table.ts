import { columnFeature } from "./features/column.svelte";
import { columnOrderFeature } from "./features/column-order.svelte";
import { columnVisibilityFeature } from "./features/column-visibility.svelte";
import { filtersFeature } from "./features/filters.svelte";
import { infiniteLoaderFeature } from "./features/infinite-loader.svelte";
import { sortingFeature } from "./features/sorting.svelte";
import { virtualWindowFeature } from "./features/virtual-window.svelte";
import { createDataTable } from "./create-data-table";
import type { DataTableColumnDef } from "./columns";
import type { DataTableCoreOptions } from "./data-table.svelte";
import type { FiltersFeatureOptions } from "./features/filters.svelte";
import type { InfiniteLoaderFeatureOptions } from "./features/infinite-loader.svelte";
import type { SortingFeatureOptions } from "./features/sorting.svelte";
import type { VirtualWindowFeatureOptions } from "./features/virtual-window.svelte";
import type { DataTable } from "./rendered-table";

export interface CreateStandardDataTableOptions<TData, TMeta = unknown> extends DataTableCoreOptions<TData> {
  columns: DataTableColumnDef<TData, TMeta>[];
  filters?: FiltersFeatureOptions;
  loader: InfiniteLoaderFeatureOptions<TData>;
  sorting?: SortingFeatureOptions;
  virtual?: VirtualWindowFeatureOptions;
}

export function createStandardDataTable<TData, TMeta = unknown>(
  options: CreateStandardDataTableOptions<TData, TMeta>,
): DataTable<TData, TMeta> {
  const features = [
    columnFeature<TData, TMeta>({
      columns: options.columns,
    }),
    columnVisibilityFeature(),
    columnOrderFeature<TData, TMeta>(),
    sortingFeature(options.sorting),
    filtersFeature(options.filters),
    infiniteLoaderFeature<TData>(options.loader),
    virtualWindowFeature(options.virtual),
  ] as const;

  return createDataTable<TData, typeof features>({
    empty: options.empty,
    getRowId: options.getRowId,
    loadingError: options.loadingError,
    features,
  });
}
