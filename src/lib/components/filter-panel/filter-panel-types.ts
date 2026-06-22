import type { DataTableComparisonOperator, DataTableContainmentOperator, DataTableTextOperator } from "../table";

export interface FilterPanelOption {
  value: string;
  label: string;
}

export interface FilterPanelCheckboxGroup {
  kind: "checkbox-group";
  id: string;
  label: string;
  filterId: string;
  operator?: DataTableContainmentOperator;
  options: FilterPanelOption[];
}

export interface FilterPanelInput {
  kind: "input";
  id: string;
  label: string;
  filterId: string;
  filterType: "comparison" | "text";
  operator: DataTableComparisonOperator | DataTableTextOperator;
  inputType: "date" | "number" | "search" | "text";
  min?: string;
  placeholder?: string;
  valueKind?: "number" | "string";
}

export interface FilterPanelInputGrid {
  kind: "input-grid";
  id: string;
  columns?: 1 | 2 | 3;
  inputs: FilterPanelInput[];
}

export type FilterPanelField = FilterPanelCheckboxGroup | FilterPanelInputGrid;

export interface FilterPanelConfig {
  title: string;
  description: string;
  clearLabel?: string;
  fields: FilterPanelField[];
}
