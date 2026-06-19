export interface FilterPanelOption {
  value: string;
  label: string;
  checked: boolean;
}

export interface FilterPanelCheckboxGroup {
  kind: "checkbox-group";
  id: string;
  label: string;
  options: FilterPanelOption[];
  onToggle: (value: string) => void;
}

export interface FilterPanelInput {
  kind: "input";
  id: string;
  label: string;
  inputType: "date" | "number" | "search" | "text";
  value: string;
  min?: string;
  placeholder?: string;
  onInput: (value: string) => void;
}

export interface FilterPanelInputGrid {
  kind: "input-grid";
  id: string;
  columns?: 1 | 2 | 3;
  inputs: FilterPanelInput[];
}

export type FilterPanelField = FilterPanelCheckboxGroup | FilterPanelInputGrid;

export interface FilterPanelConfig {
  activeFilterChips: string[];
  title: string;
  description: string;
  clearLabel?: string;
  onClear: () => void;
  fields: FilterPanelField[];
}
