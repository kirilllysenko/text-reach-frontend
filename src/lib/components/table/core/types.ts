import type { Component } from "svelte";
import type { DatagridCore } from "./index.svelte";
import type { LifecycleHooks } from "./managers/lifecycle-hooks-manager.svelte";
import type { SortingFeature } from "./features";
import type { PaginationFeature, PaginationFeatureConfig } from "./features/pagination.svelte";
import type { ColumnFilteringFeature, ColumnFilteringFeatureConfig } from "./features/column-filtering.svelte";
import type { ColumnFacetingFeature, ColumnFacetingFeatureConfig } from "./features/column-faceting.svelte";
import type { GlobalSearchFeature, GlobalSearchFeatureConfig } from "./features/global-search.svelte";
import type { GroupingFeature, GroupingFeatureConfig } from "./features/grouping.svelte";
import type { RowExpansionFeature, RowExpansionConfig } from "./features/row-expanding.svelte";
import type { RowSelectionFeature, RowSelectionFeatureConfig } from "./features/row-selection.svelte";
import type { RowPinningFeature, RowPinningFeatureConfig } from "./features/row-pinning.svelte";
import type {
  ColumnMovementDirection,
  ColumnOrderingFeature,
  ColumnOrderingFeatureConfig,
} from "./features/column-ordering.svelte";
import type { ColumnGroupingFeature, ColumnGroupingPluginConfig } from "./features/column-grouping.svelte";
import type { ColumnPinningFeature, ColumnPinningFeatureConfig } from "./features/column-pinning.svelte";
import type { ColumnSizingFeature, ColumnSizingFeatureConfig } from "./features/column-sizing.svelte";
import type { ColumnVisibilityFeature, ColumnVisibilityPluginConfig } from "./features/column-visibility.svelte";
import type { SortingFeatureConfig } from "./features/sorting.svelte";
import type { DataLoadingFeature, DataLoadingFeatureConfig } from "./features/data-loading.svelte";

// Specific interfaces for different column types

/**
 * Column and Identifier Types
 */
// export type ColumnId<T = any> = keyof T | (string & {})
export type ColumnId = string;
export type ExtractColumnIds<T> = T extends AccessorColumn<any, any>[] ? T[number]["columnId"] : never;
export type ColumnType = "accessor" | "computed" | "display" | "group";

/**
 * Primitive and Cell Value Types
 */
export type Primitive = string | number | boolean | null | undefined;
export type CellValue = Primitive | Record<string, any> | Array<any>;
export type GetValueFn<TOriginalRow> = (row: TOriginalRow) => CellValue;
export type GetGroupValue<TOriginalRow> = (row: TOriginalRow) => CellValue;
export type FormatterFn<TOriginalRow> = (row: TOriginalRow) => CellValue;

export type DataField<TOriginalRow> = {
  fieldId: string;
  label?: string;
  getValueFn: GetValueFn<TOriginalRow>;
  sortable?: boolean;
  filterable?: boolean;
  searchable?: boolean;
};

/**
 * Column State Types
 */
export type ColumnSizeState = {
  width: number;
  minWidth: number;
  maxWidth: number;
};

export type ColumnPinningPosition = "left" | "right" | "none";

export type ColumnPinningState = {
  position: ColumnPinningPosition;
  offset: number;
};

/**
 * Row and Group Types
 */
export type GridRowIdentifier = GridGroupRowIdentifier | GridBasicRowIdentifier;
export type GridGroupRowIdentifier = string;
export type GridBasicRowIdentifier = string | number;
export type RowPinningPosition = "top" | "bottom" | false;

export type GridGroupRow<TOriginalRow> = {
  index: string;
  identifier: GridGroupRowIdentifier;
  groupKey: string;
  groupValue: any[];
  depth: number;
  children: GridRow<TOriginalRow>[];
  aggregations: Aggregation[];
  isExpanded: () => boolean;
  isGroupRow: () => this is GridGroupRow<TOriginalRow>;
};

export type GridBasicRow<TOriginalRow> = {
  identifier: GridRowIdentifier;
  index: string;
  parentIndex: string | null;
  original: TOriginalRow;
  isExpanded: () => boolean;
  isGroupRow: () => false;
};

export type GridRow<TOriginalRow> = GridGroupRow<TOriginalRow> | GridBasicRow<TOriginalRow>;

/**
 * Leaf Column Types
 */
export type LeafColumn<TOriginalRow, TMeta = any> =
  | AccessorColumn<TOriginalRow, TMeta>
  | ComputedColumn<TOriginalRow, TMeta>
  | DisplayColumn<TOriginalRow, TMeta>;

export type SortableColumn<TOriginalRow> = AccessorColumn<TOriginalRow> | ComputedColumn<TOriginalRow>;

export type FilterableColumn<TOriginalRow> = AccessorColumn<TOriginalRow> | ComputedColumn<TOriginalRow>;

/**
 * Aggregation Types
 */
export type Aggregation = {
  type: string;
  value: number;
  columnId: ColumnId;
};

export type AggregationFn = (values: any[]) => any;

export type BaseAggregationConfig =
  | "sum"
  | "min"
  | "max"
  | "extent"
  | "mean"
  | "median"
  | "unique"
  | "uniqueCount"
  | "count"
  | { type: string; fn?: AggregationFn };

export type AggregationConfig = BaseAggregationConfig | BaseAggregationConfig[];

/**
 * Custom Cell and Header Types
 */
export type CustomCellComponentWithProps = {
  component: Component<any>;
  props?: any;
};

// Cell
export type CustomCellProps<TOriginalRow> = {
  datagrid: DatagridCore<any>;
  column: LeafColumn<any>;
  row: GridBasicRow<TOriginalRow>;
};

export type CustomCell<TOriginalRow> = (
  props: CustomCellProps<TOriginalRow>,
) => string | HTMLElement | CustomCellComponentWithProps;

// Aggregated Cell
export type AggregateCellProps<TOriginalRow> = {
  datagrid: DatagridCore<any>;
  column: LeafColumn<any>;
  row: GridGroupRow<TOriginalRow>;
};
export type AggregatedCell<TOriginalRow> = (
  props: AggregateCellProps<TOriginalRow>,
) => string | HTMLElement | CustomCellComponentWithProps;

// Grouped Cell
export type GroupedCellProps<TOriginalRow> = {
  datagrid: DatagridCore<any>;
  column: LeafColumn<any>;
  row: GridGroupRow<TOriginalRow>;
};

export type GroupedCell<TOriginalRow> = (
  props: GroupedCellProps<TOriginalRow>,
) => string | HTMLElement | CustomCellComponentWithProps;

// Header Cell
export type HeaderCellProps = {
  column: ColumnDef<any>;
  datagrid: DatagridCore<any>;
};

export type HeaderCell = (props: HeaderCellProps) => string | HTMLElement | CustomCellComponentWithProps;

/**
 * Sorting Types
 */

export type SortingDirection = "ascending" | "descending" | "intermediate";
export type DataTableSortDirection = SortingDirection;
export type DataTableActiveSortDirection = Exclude<DataTableSortDirection, "intermediate">;

export interface DataTableSort<TSortId extends string = string> {
  direction: DataTableActiveSortDirection;
  sortId: TSortId;
}

export interface DataTableSortDefinition<TSortId extends string = string> {
  defaultDirection?: DataTableActiveSortDirection;
  fieldId?: string;
  label?: string;
  sortId: TSortId;
}

export type DataTableSortFromDefinition<TDefinition> =
  TDefinition extends DataTableSortDefinition<infer TSortId> ? DataTableSort<TSortId> : never;

export type DataTableSortFromDefinitions<TDefinitions extends readonly DataTableSortDefinition[]> =
  DataTableSortFromDefinition<TDefinitions[number]>;

export function sortDefinition<const TSortId extends string>(
  definition: DataTableSortDefinition<TSortId>,
): DataTableSortDefinition<TSortId> {
  return definition;
}

/**
 * Pinning Types
 */
export type PinningPosition = "left" | "right" | "none";

/**
 * Filtering Types
 */
export type DataTableTextOperator = "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "EQUAL" | "NOT_EQUAL";

export type DataTableComparisonOperator =
  | "EQUAL"
  | "NOT_EQUAL"
  | "GREATER_THAN"
  | "LESS_THAN"
  | "GREATER_OR_EQUAL"
  | "LESS_OR_EQUAL";

export type DataTableContainmentOperator = "IN" | "NOT_IN";

export interface DataTableBaseFilter<TFilterId extends string = string> {
  filterId: TFilterId;
}

export interface DataTableTextFilter<TFilterId extends string = string> extends DataTableBaseFilter<TFilterId> {
  type: "text";
  operator: DataTableTextOperator;
  value: string | null;
}

export interface DataTableComparisonFilter<TFilterId extends string = string> extends DataTableBaseFilter<TFilterId> {
  type: "comparison";
  operator: DataTableComparisonOperator;
  value?: string | number;
}

export interface DataTableContainmentFilter<TFilterId extends string = string> extends DataTableBaseFilter<TFilterId> {
  type: "containment";
  operator: DataTableContainmentOperator;
  value: string[];
}

export type DataTableFilter<TFilterId extends string = string> =
  | DataTableTextFilter<TFilterId>
  | DataTableComparisonFilter<TFilterId>
  | DataTableContainmentFilter<TFilterId>;

export interface DataTableBaseFilterDefinition<TFilterId extends string = string> {
  filterId: TFilterId;
  fieldId?: string;
  hidden?: boolean;
  label?: string;
}

export interface DataTableTextFilterDefinition<
  TFilterId extends string = string,
> extends DataTableBaseFilterDefinition<TFilterId> {
  type: "text";
  defaultOperator?: DataTableTextOperator;
  operators?: readonly DataTableTextOperator[];
}

export interface DataTableComparisonFilterDefinition<
  TFilterId extends string = string,
> extends DataTableBaseFilterDefinition<TFilterId> {
  type: "comparison";
  defaultOperator?: DataTableComparisonOperator;
  operators?: readonly DataTableComparisonOperator[];
}

export interface DataTableContainmentFilterDefinition<
  TFilterId extends string = string,
> extends DataTableBaseFilterDefinition<TFilterId> {
  type: "containment";
  defaultOperator?: DataTableContainmentOperator;
  operators?: readonly DataTableContainmentOperator[];
}

export type DataTableFilterDefinition<TFilterId extends string = string> =
  | DataTableTextFilterDefinition<TFilterId>
  | DataTableComparisonFilterDefinition<TFilterId>
  | DataTableContainmentFilterDefinition<TFilterId>;

export type DataTableFilterFromDefinition<TDefinition> =
  TDefinition extends DataTableTextFilterDefinition<infer TFilterId>
    ? DataTableTextFilter<TFilterId>
    : TDefinition extends DataTableComparisonFilterDefinition<infer TFilterId>
      ? DataTableComparisonFilter<TFilterId>
      : TDefinition extends DataTableContainmentFilterDefinition<infer TFilterId>
        ? DataTableContainmentFilter<TFilterId>
        : never;

export type DataTableFilterFromDefinitions<TDefinitions extends readonly DataTableFilterDefinition[]> =
  DataTableFilterFromDefinition<TDefinitions[number]>;

export function textFilter<const TFilterId extends string>(
  definition: Omit<DataTableTextFilterDefinition<TFilterId>, "type">,
): DataTableTextFilterDefinition<TFilterId> {
  return { ...definition, type: "text" };
}

export function comparisonFilter<const TFilterId extends string>(
  definition: Omit<DataTableComparisonFilterDefinition<TFilterId>, "type">,
): DataTableComparisonFilterDefinition<TFilterId> {
  return { ...definition, type: "comparison" };
}

export function containmentFilter<const TFilterId extends string>(
  definition: Omit<DataTableContainmentFilterDefinition<TFilterId>, "type">,
): DataTableContainmentFilterDefinition<TFilterId> {
  return { ...definition, type: "containment" };
}

export type DataTableCursor = unknown[] | null;
export type DataTablePageDirection = "next" | "previous";

export interface DataTablePageRequest {
  cursor: DataTableCursor;
  direction: DataTablePageDirection;
  limit: number;
  offset?: number;
  page: number;
}

export interface DataTableLoadRequest {
  cursor: DataTableCursor;
  direction?: DataTablePageDirection;
  filters: DataTableFilter[];
  limit: number;
  offset?: number;
  page?: number;
  signal?: AbortSignal;
  sorting: DataTableSort[];
}

export interface DataTableLoadResult<TData> {
  nextCursor: DataTableCursor;
  previousCursor?: DataTableCursor;
  rows: TData[];
  totalRows: number;
}

export type DataTableLoadReason =
  | "filtering"
  | "initial"
  | "pagination"
  | "pagination-size"
  | "reload"
  | "search"
  | "sorting";

export type DataTableLoader<TData> = (
  request: DataTableLoadRequest,
) => DataTableLoadResult<TData> | Promise<DataTableLoadResult<TData>>;

/**
 * Search State
 */
export interface SearchState {
  value: string;
  fuzzy: boolean;
  delay: number;
}

// Columns
type DotPrefix<T extends string> = T extends "" ? "" : `.${T}`;
export type DotNestedKeys<T> = (
  T extends object
    ? {
        [K in Exclude<keyof T, symbol>]: `${K}${DotPrefix<DotNestedKeys<T[K]>>}`;
      }[Exclude<keyof T, symbol>]
    : ""
) extends infer D
  ? Extract<D, string>
  : never;
// Specific interfaces for different column types

export type ColumnAlign = "left" | "center" | "right";

export interface AccessorColumn<TOriginalRow, TMeta = any> {
  type: "accessor";
  header: string;
  // columnId: DotNestedKeys<TOriginalRow>;
  columnId: ColumnId;
  parentColumnId: string | null;
  accessorKey: DotNestedKeys<TOriginalRow>;
  getValueFn: GetValueFn<TOriginalRow>;
  formatterFn?: FormatterFn<TOriginalRow>;
  aggregate?: AggregationConfig;
  getGroupValueFn?: GetGroupValue<TOriginalRow>;
  cell?: CustomCell<TOriginalRow>;
  aggregatedCell?: AggregatedCell<TOriginalRow>;
  groupedCell?: GroupedCell<TOriginalRow>;
  headerCell?: HeaderCell;
  options: {
    calculateFacets: boolean;
    searchable: boolean;
    groupable: boolean;
    sortable: boolean;
    filterable: boolean;
    pinnable: boolean;
    moveable: boolean;
    hideable: boolean;
    resizable: boolean;
  };
  state: {
    size: ColumnSizeState;
    visible: boolean;
    pinning: ColumnPinningState;
  };
  align: ColumnAlign;
  _meta: TMeta;
  isVisible(): boolean;
  isSortable(): boolean;
  isFilterable(): boolean;
}

export interface ComputedColumn<TOriginalRow, TMeta = any> {
  type: "computed";
  header: string;
  columnId: ColumnId;
  parentColumnId: ColumnId | null;
  // accessorFn: AccessorFn<TOriginalRow>;
  getValueFn: GetValueFn<TOriginalRow>;
  getGroupValueFn?: GetGroupValue<TOriginalRow>;
  cell?: CustomCell<TOriginalRow>;
  aggregatedCell?: AggregatedCell<TOriginalRow>;
  groupedCell?: GroupedCell<TOriginalRow>;
  headerCell?: HeaderCell;
  formatterFn?: FormatterFn<TOriginalRow>;
  aggregate?: AggregationConfig;
  options: {
    calculateFacets: boolean;
    searchable: boolean;
    groupable: boolean;
    sortable: boolean;
    filterable: boolean;
    pinnable: boolean;
    moveable: boolean;
    hideable: boolean;
    resizable: boolean;
  };
  state: {
    size: ColumnSizeState;
    visible: boolean;
    pinning: ColumnPinningState;
  };
  align: ColumnAlign;
  _meta: TMeta;
  isVisible(): boolean;
  isSortable(): boolean;
  isFilterable(): boolean;
}

export interface DisplayColumn<TOriginalRow, TMeta = any> {
  type: "display";
  header: string;
  columnId: ColumnId;
  parentColumnId: string | null;
  cell: CustomCell<TOriginalRow>;
  aggregatedCell?: AggregatedCell<TOriginalRow>;
  groupedCell?: GroupedCell<TOriginalRow>;
  headerCell?: HeaderCell;
  options: {
    calculateFacets: null;
    searchable: null;
    groupable: null;
    sortable: null;
    filterable: null;
    pinnable: boolean;
    moveable: boolean;
    hideable: boolean;
    resizable: boolean;
  };
  state: {
    size: ColumnSizeState;
    visible: boolean;
    pinning: ColumnPinningState;
  };
  align: ColumnAlign;
  _meta: TMeta;
  isVisible(): boolean;
  isSortable(): boolean;
  isFilterable(): boolean;
}

export interface ColumnGroup<TOriginalRow, TMeta = any> {
  type: "group";
  header: string;
  headerCell?: HeaderCell;
  columnId: ColumnId;
  parentColumnId: string | null;
  columns: ColumnDef<TOriginalRow>[];
  options: {
    searchable: null;
    groupable: null;
    sortable: null;
    filterable: null;
    pinnable: null;
    moveable: boolean;
    resizable: boolean;
  };
  state: {
    size: ColumnSizeState;
    visible: null;
    pinning: ColumnPinningState;
  };
  _meta: TMeta;
  isVisible(): boolean;
  isSortable(): boolean;
  isFilterable(): boolean;
}
// Union type for all column types

export type ColumnDef<TOriginalRow, TMeta = any> =
  | AccessorColumn<TOriginalRow, TMeta>
  | ComputedColumn<TOriginalRow, TMeta>
  | DisplayColumn<TOriginalRow, TMeta>
  | ColumnGroup<TOriginalRow, TMeta>;

export type ParentColumnId = string | null;

export type FeatureConstructor<T> = {
  new (datagrid: DatagridCore<any>, config?: any): T; // Class signature
};

export type InitialState = {
  dataLoading?: DataLoadingFeatureConfig;
  sorting?: SortingFeatureConfig;
  pagination?: PaginationFeatureConfig;
  filtering?: ColumnFilteringFeatureConfig;
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

export type DefaultColumnSize = {
  width: number;
  minWidth: number;
  maxWidth: number;
};

export type DefaultColumnConfig = {
  size?: DefaultColumnSize;
};

export type DatagridCoreConfigDefaults = {
  column?: DefaultColumnConfig;
};

export type DatagridCoreConfig<TOriginalRow, C extends ColumnDef<TOriginalRow> = ColumnDef<TOriginalRow>> = {
  columns: C[];
  data: TOriginalRow[];
  dataFields?: DataField<TOriginalRow>[];
  lifecycleHooks?: LifecycleHooks<TOriginalRow>;

  initialState?: InitialState;

  measurePerformance?: boolean;
  rowIdGetter?: (row: TOriginalRow) => string;
  rowIndexGetter?: (row: TOriginalRow) => string;

  features?: {
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

  default?: DatagridCoreConfigDefaults;
};

export interface Command {
  execute(): void;
  undo?(): void;
}

export type CommandPayload = {
  type: string;
  payload: any;
};

export type GridEventCallback<T = any> = (data: T) => void;

export type OnPageChangePayload = { prevPage: number; newPage: number };

export type EventPayloadMap = {
  onColumnSort: { column: LeafColumn<any>; multisort?: boolean };
  onSortingChange: { column?: LeafColumn<any>; multisort?: boolean; sortId?: string };

  onRowPin: { rowId: GridRowIdentifier };
  onRowUnpin: { rowIdentifier: GridRowIdentifier };

  onRowSelect: { rowIdentifier: GridRowIdentifier };
  onRowDeselect: { rowIdentifier: GridRowIdentifier };
  onRowSelectionLimitExceeded: { rowIdentifier: GridRowIdentifier };

  onRowExpand: { rowIdentifier: GridRowIdentifier };
  onRowCollapse: { rowIdentifier: GridRowIdentifier };
  onRowExpansionLimitExceeded: { rowIdentifier: GridRowIdentifier };

  onPageChange: OnPageChangePayload;
  onPageSizeChange: { prevSize: number; pageSize: number };

  onGroupExpand: { groupIdentifier: GridGroupRowIdentifier };
  onGroupCollapse: { groupIdentifier: GridGroupRowIdentifier };
  onGroupExpansionLimitExceeded: { maxExpandedGroups: number };
  onActiveGroupsLimitExceeded: { maxActiveGroups: number };

  onGroupingChange: { activeGroups: ColumnId[] };

  onSearchQueryChange: { prevQuery: string; newQuery: string };

  onFilterChange: { column?: LeafColumn<any>; filterId?: string };
  onColumnResize: { column: LeafColumn<any> };
  onColumnVisibilityChange: { column: LeafColumn<any> };

  onColumnGroupCreation: { columnGroup: ColumnGroup<any> };
  onColumnGroupDeletion: { columnGroup: ColumnGroup<any> };
  onColumnPinningChange: { column: LeafColumn<any> };
  onColumnReorder: { columnId: ColumnId; direction: ColumnMovementDirection };

  onCellEdit: { prevOriginalRow: any; newOriginalRow: any; prevValue: any; newValue: any; column: LeafColumn<any> };
};
