import type { CellValue, FormatterFn, GetGroupValue } from "../data-types";
import type {
  AggregatedCell,
  AggregationConfig,
  ColumnAlign,
  ColumnDef,
  ColumnId,
  ColumnPinningState,
  ColumnSizeState,
  CustomCell,
  DotNestedKeys,
  GroupedCell,
  HeaderCell,
  ParentColumnId,
} from "../column-types";

// Column creation props
export type CreateAccessorColumnProps<TOriginalRow, TKey extends DotNestedKeys<TOriginalRow>, TMeta> = {
  accessorKey: TKey;
  header?: string;
  getValueFn?: (row: TOriginalRow) => CellValue;
  getGroupValueFn?: GetGroupValue<TOriginalRow>;
  aggregate?: AggregationConfig;
  cell?: CustomCell<TOriginalRow>;
  aggregatedCell?: AggregatedCell<TOriginalRow>;
  groupedCell?: GroupedCell<TOriginalRow>;
  headerCell?: HeaderCell;
  formatterFn?: FormatterFn<TOriginalRow>;
  options?: {
    calculateFacets?: boolean;
    searchable?: boolean;
    groupable?: boolean;
    sortable?: boolean;
    filterable?: boolean;
    pinnable?: boolean;
    moveable?: boolean;
    hideable?: boolean;
    resizable?: boolean;
  };
  align?: ColumnAlign;
  state?: ColumnCreationStateProps;
} & CommonColumnCreationProps<TMeta>;

export type CreateComputeColumnProps<TOriginalRow, TMeta> = {
  // accessorFn: (row: TOriginalRow) => CellValue;
  getValueFn: (row: TOriginalRow) => CellValue;
  aggregate?: AggregationConfig;
  getGroupValueFn?: GetGroupValue<TOriginalRow>;
  formatterFn?: FormatterFn<TOriginalRow>;
  cell?: CustomCell<TOriginalRow>;
  aggregatedCell?: AggregatedCell<TOriginalRow>;
  groupedCell?: GroupedCell<TOriginalRow>;
  headerCell?: HeaderCell;
  options?: {
    calculateFacets?: boolean;
    searchable?: boolean;
    groupable?: boolean;
    sortable?: boolean;
    filterable?: boolean;
    pinnable?: boolean;
    moveable?: boolean;
    hideable?: boolean;
    resizable?: boolean;
  };
  align?: ColumnAlign;
  header: string;
  state?: ColumnCreationStateProps;
} & CommonColumnCreationProps<TMeta>;

export type CreateDisplayColumnProps<TOriginalRow, TMeta> = {
  cell: CustomCell<TOriginalRow>;
  headerCell?: HeaderCell;
  aggregatedCell?: AggregatedCell<TOriginalRow>;
  groupedCell?: GroupedCell<TOriginalRow>;
  options?: {
    searchable?: false;
    groupable?: false;
    sortable?: false;
    filterable?: false;
    pinnable?: boolean;
    moveable?: boolean;
    hideable?: boolean;
    resizable?: boolean;
  };
  header: string;
  align?: ColumnAlign;
  state?: ColumnCreationStateProps;
} & CommonColumnCreationProps<TMeta>;

export type CreateGroupColumnProps<TOriginalRow, TMeta> = {
  header: string;
  headerCell?: HeaderCell;
  columns: ColumnDef<TOriginalRow>[];
} & CommonColumnCreationProps<TMeta>;

type ColumnCreationStateProps = {
  size?: ColumnSizeState;
  visible?: boolean;
  pinning?: Partial<ColumnPinningState>;
};

type CommonColumnCreationProps<TMeta> = {
  _meta?: TMeta;
  parentColumnId?: ParentColumnId;
  columnId?: ColumnId;
};
