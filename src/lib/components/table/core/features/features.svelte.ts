import type { DatagridCoreConfig } from "../config";
import type { DatagridCore } from "../index.svelte";
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

export class DatagridFeatures<TOriginalRow = any> {
  readonly datagrid: DatagridCore<TOriginalRow>;
  readonly dataLoading: DataLoadingFeature<TOriginalRow>;
  readonly pagination: PaginationFeature<TOriginalRow>;
  readonly sorting: SortingFeature;
  readonly grouping: GroupingFeature;
  readonly filtering: ColumnFilteringFeature<TOriginalRow>;
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

  constructor(datagrid: DatagridCore<TOriginalRow>, config?: DatagridCoreConfig<TOriginalRow>) {
    this.datagrid = datagrid;
    const overrides = config?.features;
    const initial = config?.initialState;

    this.sorting = new (overrides?.sorting ?? SortingFeature)(datagrid, initial?.sorting ?? {});
    this.dataLoading = new (overrides?.dataLoading ?? DataLoadingFeature)(datagrid, initial?.dataLoading ?? {});
    this.rowSelection = new (overrides?.rowSelection ?? RowSelectionFeature)(datagrid, initial?.rowSelection ?? {});
    this.rowPinning = new (overrides?.rowPinning ?? RowPinningFeature)(datagrid, initial?.rowPinning ?? {});
    this.rowExpanding = new (overrides?.rowExpanding ?? RowExpandingFeature)(datagrid, initial?.rowExpanding ?? {});
    this.pagination = new (overrides?.pagination ?? PaginationFeature)(datagrid, initial?.pagination ?? {});
    this.grouping = new (overrides?.grouping ?? GroupingFeature)(datagrid, initial?.grouping ?? {});
    this.globalSearch = new (overrides?.globalSearch ?? GlobalSearchFeature)(datagrid, initial?.globalSearch ?? {});
    this.columnGrouping = new (overrides?.columnGrouping ?? ColumnGroupingFeature)(
      datagrid,
      initial?.columnGrouping ?? {},
    );
    this.columnPinning = new (overrides?.columnPinning ?? ColumnPinningFeature)(datagrid, initial?.columnPinning ?? {});
    this.columnSizing = new (overrides?.columnSizing ?? ColumnSizingFeature)(datagrid, initial?.columnSizing ?? {});
    this.columnVisibility = new (overrides?.columnVisibility ?? ColumnVisibilityFeature)(
      datagrid,
      initial?.columnVisibility ?? {},
    );
    this.columnOrdering = new (overrides?.columnOrdering ?? ColumnOrderingFeature)(
      datagrid,
      initial?.columnOrdering ?? {},
    );
    this.filtering = new (overrides?.filtering ?? ColumnFilteringFeature)(datagrid, initial?.filtering ?? {});
    this.columnFaceting = new (overrides?.faceting ?? ColumnFacetingFeature)(datagrid, initial?.faceting ?? {});
  }
}
