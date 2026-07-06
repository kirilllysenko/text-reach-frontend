import type {
  ColumnType,
  DataTableComparisonOperator,
  DataTableContainmentOperator,
  DataTableTextOperator,
} from "./types";

export const columnsWithGetters = ["accessor", "computed"] satisfies ColumnType[];

export const textFilterOperators = [
  "CONTAINS",
  "NOT_CONTAINS",
  "STARTS_WITH",
  "ENDS_WITH",
  "EQUAL",
  "NOT_EQUAL",
] satisfies DataTableTextOperator[];

export const comparisonFilterOperators = [
  "EQUAL",
  "NOT_EQUAL",
  "GREATER_THAN",
  "LESS_THAN",
  "GREATER_OR_EQUAL",
  "LESS_OR_EQUAL",
] satisfies DataTableComparisonOperator[];

export const containmentFilterOperators = ["IN", "NOT_IN"] satisfies DataTableContainmentOperator[];
