import type { GridRow } from "../row-types";

export type CacheTarget = "everything" | "sortedData" | "filteredData" | "hierarchicalRows" | "rows" | "paginatedRows";

export class DatagridCacheManager<TOriginalRow> {
  sortedData: TOriginalRow[] | null = $state.raw(null);
  filteredData: TOriginalRow[] | null = $state.raw(null);
  paginatedRows: GridRow<TOriginalRow>[] | null = $state(null);
  rows: GridRow<TOriginalRow>[] = $state.raw([]);
  hierarchicalRows: GridRow<TOriginalRow>[] | null = $state.raw(null);

  invalidate(target: CacheTarget): void {
    if (target === "everything" || target === "sortedData") this.sortedData = null;
    if (target === "everything" || target === "filteredData") this.filteredData = null;
    if (target === "everything" || target === "hierarchicalRows") this.hierarchicalRows = null;
    if (target === "everything" || target === "rows") this.rows = [];
    if (target === "everything" || target === "paginatedRows") this.paginatedRows = null;
  }

  invalidateGroupedRowsCache(): void {
    this.rows = [];
    this.paginatedRows = null;
  }
}
