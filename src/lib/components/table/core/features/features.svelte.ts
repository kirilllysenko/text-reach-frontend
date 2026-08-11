import type { DatagridCoreConfig } from "../config";
import type { DatagridCore } from "../index.svelte";
import type { DataTableSort } from "./sorting.svelte";
import type { DataTableFilter } from "./column-filtering.svelte";
import {
  ColumnFacetingFeature,
  ColumnFilteringFeature,
  ColumnGroupingFeature,
  ColumnOrderingFeature,
  ColumnPinningFeature,
  ColumnSizingFeature,
  ColumnVisibilityFeature,
  DataLoadingFeature,
  GlobalSearchFeature,
  GroupingFeature,
  PaginationFeature,
  RowExpandingFeature,
  RowPinningFeature,
  RowSelectionFeature,
  SortingFeature,
} from "../features";

export class DatagridFeatures<TOriginalRow = any, TSort = DataTableSort, TFilter = DataTableFilter> {
  readonly datagrid: DatagridCore<TOriginalRow, TSort, TFilter>;
  readonly dataLoading: DataLoadingFeature<TOriginalRow, TSort, TFilter>;
  readonly pagination: PaginationFeature<TOriginalRow>;
  readonly sorting: SortingFeature<TSort>;
  readonly grouping: GroupingFeature;
  readonly filtering: ColumnFilteringFeature<TOriginalRow, TFilter>;
  readonly globalSearch: GlobalSearchFeature;
  readonly columnSizing: ColumnSizingFeature<TOriginalRow>;
  readonly columnVisibility: ColumnVisibilityFeature<TOriginalRow>;
  readonly columnPinning: ColumnPinningFeature;
  readonly columnFaceting: ColumnFacetingFeature<TOriginalRow>;
  readonly columnOrdering: ColumnOrderingFeature<TOriginalRow>;
  readonly columnGrouping: ColumnGroupingFeature<TOriginalRow>;
  readonly rowExpanding: RowExpandingFeature<TOriginalRow>;
  readonly rowSelection: RowSelectionFeature<TOriginalRow>;
  readonly rowPinning: RowPinningFeature<TOriginalRow>;

  constructor(
    datagrid: DatagridCore<TOriginalRow, TSort, TFilter>,
    config?: DatagridCoreConfig<TOriginalRow, TSort, TFilter>,
  ) {
    this.datagrid = datagrid;
    const overrides = config?.features;
    const initial = config?.initialState;

    const SortingConstructor = (overrides?.sorting ?? SortingFeature) as new (
      datagrid: DatagridCore<TOriginalRow, TSort, TFilter>,
      config: NonNullable<typeof initial>["sorting"],
    ) => SortingFeature<TSort>;
    const DataLoadingConstructor = (overrides?.dataLoading ?? DataLoadingFeature) as new (
      datagrid: DatagridCore<TOriginalRow, TSort, TFilter>,
      config: NonNullable<typeof initial>["dataLoading"],
    ) => DataLoadingFeature<TOriginalRow, TSort, TFilter>;
    const FilteringConstructor = (overrides?.filtering ?? ColumnFilteringFeature) as new (
      datagrid: DatagridCore<TOriginalRow, TSort, TFilter>,
      config: NonNullable<typeof initial>["filtering"],
    ) => ColumnFilteringFeature<TOriginalRow, TFilter>;

    this.sorting = new SortingConstructor(datagrid, initial?.sorting ?? {});
    this.dataLoading = new DataLoadingConstructor(datagrid, initial?.dataLoading ?? {});
    this.rowSelection = new (overrides?.rowSelection ?? RowSelectionFeature)(
      datagrid as any,
      initial?.rowSelection ?? {},
    );
    this.rowPinning = new (overrides?.rowPinning ?? RowPinningFeature)(datagrid as any, initial?.rowPinning ?? {});
    this.rowExpanding = new (overrides?.rowExpanding ?? RowExpandingFeature)(
      datagrid as any,
      initial?.rowExpanding ?? {},
    );
    this.pagination = new (overrides?.pagination ?? PaginationFeature)(datagrid as any, initial?.pagination ?? {});
    this.grouping = new (overrides?.grouping ?? GroupingFeature)(datagrid as any, initial?.grouping ?? {});
    this.globalSearch = new (overrides?.globalSearch ?? GlobalSearchFeature)(
      datagrid as any,
      initial?.globalSearch ?? {},
    );
    this.columnGrouping = new (overrides?.columnGrouping ?? ColumnGroupingFeature)(
      datagrid as any,
      initial?.columnGrouping ?? {},
    );
    this.columnPinning = new (overrides?.columnPinning ?? ColumnPinningFeature)(
      datagrid as any,
      initial?.columnPinning ?? {},
    );
    this.columnSizing = new (overrides?.columnSizing ?? ColumnSizingFeature)(
      datagrid as any,
      initial?.columnSizing ?? {},
    );
    this.columnVisibility = new (overrides?.columnVisibility ?? ColumnVisibilityFeature)(
      datagrid as any,
      initial?.columnVisibility ?? {},
    );
    this.columnOrdering = new (overrides?.columnOrdering ?? ColumnOrderingFeature)(
      datagrid as any,
      initial?.columnOrdering ?? {},
    );
    this.filtering = new FilteringConstructor(datagrid, initial?.filtering ?? {});
    this.columnFaceting = new (overrides?.faceting ?? ColumnFacetingFeature)(datagrid as any, initial?.faceting ?? {});
  }
}
