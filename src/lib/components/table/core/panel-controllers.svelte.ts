import type { DataTableFilter, DataTableSort, DataTableSortDirection } from "./types";

type ChangeHandler = () => void;

export function createFilterController(onChange: ChangeHandler) {
  let filters = $state<DataTableFilter[]>([]);

  function setAll(nextFilters: DataTableFilter[]): void {
    filters = nextFilters;
    onChange();
  }

  return {
    get filters() {
      return filters;
    },
    clear(): void {
      setAll([]);
    },
    remove(filterId: string): void {
      setAll(filters.filter((filter) => filter.filterId !== filterId));
    },
    reset(): void {
      setAll([]);
    },
    set(filterId: string, filter: DataTableFilter): void {
      setAll([...filters.filter((current) => current.filterId !== filterId), { ...filter, filterId }]);
    },
  };
}

export function createSortController(initialSorts: DataTableSort[], onChange: ChangeHandler) {
  let sorts = $state<DataTableSort[]>(initialSorts);

  function setAll(nextSorts: DataTableSort[]): void {
    sorts = nextSorts;
    onChange();
  }

  return {
    get sorts() {
      return sorts;
    },
    add(sortId: string, direction: Exclude<DataTableSortDirection, "intermediate"> = "ascending"): void {
      setAll([...sorts.filter((sort) => sort.sortId !== sortId), { direction, sortId }]);
    },
    clear(): void {
      setAll([]);
    },
    removeAt(index: number): void {
      setAll(sorts.filter((_, currentIndex) => currentIndex !== index));
    },
    updateDirection(index: number, direction: Exclude<DataTableSortDirection, "intermediate">): void {
      setAll(sorts.map((sort, currentIndex) => (currentIndex === index ? { ...sort, direction } : sort)));
    },
    updateSortId(index: number, sortId: string): void {
      setAll(sorts.map((sort, currentIndex) => (currentIndex === index ? { ...sort, sortId } : sort)));
    },
  };
}
