import type { Component } from "svelte";
import type { FormatterFn, GetGroupValue, GetValueFn } from "./data-types";
import type { DatagridCore } from "./index.svelte";
import type { GridBasicRow, GridGroupRow } from "./row-types";

export type ColumnId = string;
export type ColumnType = "accessor" | "computed" | "display" | "group";
export type ColumnAlign = "left" | "center" | "right";
export type PinningPosition = "left" | "right" | "none";

export type ColumnSizeState = {
  width: number;
  minWidth: number;
  maxWidth: number;
};

export type ColumnPinningState = {
  position: PinningPosition;
  offset: number;
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

export type CustomCellComponentWithProps = {
  component: Component<any>;
  props?: any;
};

export type CustomCellProps<TOriginalRow> = {
  datagrid: DatagridCore<any>;
  column: LeafColumn<any>;
  row: GridBasicRow<TOriginalRow>;
};

export type CustomCell<TOriginalRow> = (
  props: CustomCellProps<TOriginalRow>,
) => string | HTMLElement | CustomCellComponentWithProps;

export type AggregateCellProps<TOriginalRow> = {
  datagrid: DatagridCore<any>;
  column: LeafColumn<any>;
  row: GridGroupRow<TOriginalRow>;
};

export type AggregatedCell<TOriginalRow> = (
  props: AggregateCellProps<TOriginalRow>,
) => string | HTMLElement | CustomCellComponentWithProps;

export type GroupedCellProps<TOriginalRow> = {
  datagrid: DatagridCore<any>;
  column: LeafColumn<any>;
  row: GridGroupRow<TOriginalRow>;
};

export type GroupedCell<TOriginalRow> = (
  props: GroupedCellProps<TOriginalRow>,
) => string | HTMLElement | CustomCellComponentWithProps;

export type HeaderCellProps = {
  column: ColumnDef<any>;
  datagrid: DatagridCore<any>;
};

export type HeaderCell = (props: HeaderCellProps) => string | HTMLElement | CustomCellComponentWithProps;

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

export interface AccessorColumn<TOriginalRow, TMeta = any> {
  type: "accessor";
  header: string;
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

export type LeafColumn<TOriginalRow, TMeta = any> =
  | AccessorColumn<TOriginalRow, TMeta>
  | ComputedColumn<TOriginalRow, TMeta>
  | DisplayColumn<TOriginalRow, TMeta>;

export type ColumnDef<TOriginalRow, TMeta = any> = LeafColumn<TOriginalRow, TMeta> | ColumnGroup<TOriginalRow, TMeta>;

export type ParentColumnId = string | null;
