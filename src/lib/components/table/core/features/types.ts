import type { ColumnFacetingFeature } from "./column-faceting.svelte";
import type { ColumnFilteringFeature, DataTableFilter } from "./column-filtering.svelte";
import type { ColumnGroupingFeature } from "./column-grouping.svelte";
import type { ColumnOrderingFeature } from "./column-ordering.svelte";
import type { ColumnPinningFeature } from "./column-pinning.svelte";
import type { ColumnSizingFeature } from "./column-sizing.svelte";
import type { ColumnVisibilityFeature } from "./column-visibility.svelte";
import type { DataLoadingFeature } from "./data-loading.svelte";
import type { GlobalSearchFeature } from "./global-search.svelte";
import type { GroupingFeature } from "./grouping.svelte";
import type { PaginationFeature } from "./pagination.svelte";
import type { RowExpansionFeature } from "./row-expanding.svelte";
import type { RowPinningFeature } from "./row-pinning.svelte";
import type { RowSelectionFeature } from "./row-selection.svelte";
import type { SortingFeature } from "./sorting.svelte";
import type { DatagridCore } from "../index.svelte";
import type { ColumnFacetingFeatureConfig } from "./column-faceting.svelte";
import type { ColumnFilteringFeatureConfig } from "./column-filtering.svelte";
import type { ColumnGroupingPluginConfig } from "./column-grouping.svelte";
import type { ColumnOrderingFeatureConfig } from "./column-ordering.svelte";
import type { ColumnPinningFeatureConfig } from "./column-pinning.svelte";
import type { ColumnSizingFeatureConfig } from "./column-sizing.svelte";
import type { ColumnVisibilityPluginConfig } from "./column-visibility.svelte";
import type { DataLoadingFeatureConfig } from "./data-loading.svelte";
import type { GlobalSearchFeatureConfig } from "./global-search.svelte";
import type { GroupingFeatureConfig } from "./grouping.svelte";
import type { PaginationFeatureConfig } from "./pagination.svelte";
import type { RowExpansionConfig } from "./row-expanding.svelte";
import type { RowPinningFeatureConfig } from "./row-pinning.svelte";
import type { RowSelectionFeatureConfig } from "./row-selection.svelte";
import type { SortingFeatureConfig } from "./sorting.svelte";
import type { DataTableSort } from "./sorting.svelte";

export type BuiltInFeature =
  | ColumnFacetingFeature
  | ColumnFilteringFeature
  | ColumnGroupingFeature
  | ColumnOrderingFeature
  | ColumnPinningFeature
  | ColumnSizingFeature
  | ColumnVisibilityFeature
  | DataLoadingFeature
  | GlobalSearchFeature
  | GroupingFeature
  | PaginationFeature
  | RowExpansionFeature
  | RowPinningFeature
  | RowSelectionFeature
  | SortingFeature;

export type FeatureConstructor<T> = {
  new (datagrid: DatagridCore<any>, config?: any): T;
};

export type InitialState<TOriginalRow = any, TSort = DataTableSort, TFilter = DataTableFilter> = {
  dataLoading?: DataLoadingFeatureConfig<TOriginalRow, TSort, TFilter>;
  sorting?: SortingFeatureConfig<TSort>;
  pagination?: PaginationFeatureConfig;
  filtering?: ColumnFilteringFeatureConfig<TFilter>;
  faceting?: ColumnFacetingFeatureConfig;
  globalSearch?: GlobalSearchFeatureConfig;
  grouping?: GroupingFeatureConfig;
  rowExpanding?: RowExpansionConfig;
  rowSelection?: RowSelectionFeatureConfig;
  rowPinning?: RowPinningFeatureConfig;
  columnOrdering?: ColumnOrderingFeatureConfig;
  columnGrouping?: ColumnGroupingPluginConfig;
  columnPinning?: ColumnPinningFeatureConfig;
  columnSizing?: ColumnSizingFeatureConfig;
  columnVisibility?: ColumnVisibilityPluginConfig;
};

export type FeatureOverrides = {
  dataLoading?: FeatureConstructor<DataLoadingFeature>;
  sorting?: FeatureConstructor<SortingFeature>;
  pagination?: FeatureConstructor<PaginationFeature>;
  filtering?: FeatureConstructor<ColumnFilteringFeature>;
  faceting?: FeatureConstructor<ColumnFacetingFeature>;
  globalSearch?: FeatureConstructor<GlobalSearchFeature>;
  grouping?: FeatureConstructor<GroupingFeature>;
  rowExpanding?: FeatureConstructor<RowExpansionFeature>;
  rowSelection?: FeatureConstructor<RowSelectionFeature>;
  rowPinning?: FeatureConstructor<RowPinningFeature>;
  columnOrdering?: FeatureConstructor<ColumnOrderingFeature>;
  columnGrouping?: FeatureConstructor<ColumnGroupingFeature>;
  columnPinning?: FeatureConstructor<ColumnPinningFeature>;
  columnSizing?: FeatureConstructor<ColumnSizingFeature>;
  columnVisibility?: FeatureConstructor<ColumnVisibilityFeature>;
};
