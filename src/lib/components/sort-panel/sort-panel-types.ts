import type { DataTableActiveSortDirection, DataTableSort } from "../table/core/features/sorting.svelte";

export interface SortPanelController {
  sorts: DataTableSort[];
  addSort: (sortId: string, direction?: DataTableActiveSortDirection) => void;
  clearSorts: () => void;
  removeSortAt: (index: number) => void;
  updateSortDirection: (index: number, direction: DataTableActiveSortDirection) => void;
  updateSortId: (index: number, sortId: string) => void;
}
