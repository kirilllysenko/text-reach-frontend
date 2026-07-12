export interface DropdownOption<T> {
  id: T;
  value: string;
}

export interface MultiComboboxOption {
  value: string;
  display: string;
}

export interface MultiComboboxLoadRequest {
  search: string;
  cursor: unknown[] | null;
  pageSize: number;
  signal: AbortSignal;
}

export interface MultiComboboxLoadResult {
  items: MultiComboboxOption[];
  nextCursor: unknown[] | null;
}
