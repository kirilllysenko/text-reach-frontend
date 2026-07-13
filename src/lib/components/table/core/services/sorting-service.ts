import type { LeafColumn } from "../column-types";
import type { DataTableActiveSortDirection, DataTableSort, DataTableSortDefinition } from "../features/sorting.svelte";
import { BaseService } from "./base-service";

/**
 * Interface for sorting-related services in a data grid.
 */
export type ISortingService = {
  toggleColumnSort(column: LeafColumn<any>, multisort: boolean): void;
  toggleSort(sortId: string, multisort: boolean): void;
  applyAscendingSort(column: LeafColumn<any>): void;
  applyDescendingSort(column: LeafColumn<any>): void;
  clearColumnSort(column: LeafColumn<any>): void;
  applyAscendingSortByField(fieldId: string): void;
  applyDescendingSortByField(fieldId: string): void;
  clearFieldSort(fieldId: string): void;
  addSort(sortId: string, direction?: DataTableActiveSortDirection): void;
  removeSortAt(index: number): void;
  setSorts(sorts: DataTableSort[]): void;
  updateSortDirection(index: number, direction: DataTableActiveSortDirection): void;
  updateSortId(index: number, sortId: string): void;
  clearSorts(): void;
};

/**
 * Class responsible for managing ordered sorting rules in a data grid.
 */
export class SortingService extends BaseService {
  get sorts(): DataTableSort[] {
    return this.datagrid.features.sorting.sorts;
  }

  get sortDefinitions(): readonly DataTableSortDefinition[] {
    return this.datagrid.features.sorting.sortDefinitions;
  }

  toggleColumnSort(column: LeafColumn<any>, multisort: boolean): void {
    this.datagrid.events.emit("onColumnSort", { column, multisort });
    this.toggleSort(column.columnId, multisort, column);
  }

  toggleSort(sortId: string, multisort: boolean, column?: LeafColumn<any>): void {
    if (!this.isSortable(sortId)) {
      return;
    }

    const sorting = this.datagrid.features.sorting;
    const sort = sorting.getSort(sortId);
    const useMultiSort = multisort && sorting.allowMultiSort;
    const defaultDirection = sorting.getSortDefaultDirection(sortId);
    const alternateDirection = this.getAlternateDirection(defaultDirection);

    if (!useMultiSort) {
      if (!sort) {
        sorting.setSorts([{ direction: defaultDirection, sortId }]);
      } else if (sort.direction === defaultDirection) {
        sorting.setSorts([{ direction: alternateDirection, sortId }]);
      } else {
        sorting.clearSorts();
      }

      this.refreshSorting(sortId, column, multisort);
      return;
    }

    if (!sort) {
      const nextSorts = sorting.sorts.slice();
      if (nextSorts.length >= sorting.maxMultiSortColumns) {
        nextSorts.shift();
      }

      sorting.setSorts([...nextSorts, { direction: defaultDirection, sortId }]);
    } else if (sort.direction === defaultDirection) {
      sorting.updateSort(sortId, alternateDirection);
    } else {
      sorting.removeSort(sortId);
    }

    this.refreshSorting(sortId, column, multisort);
  }

  applyAscendingSort(column: LeafColumn<any>): void {
    this.datagrid.events.emit("onColumnSort", { column });
    this.applySort(column.columnId, "ascending", column);
  }

  applyDescendingSort(column: LeafColumn<any>): void {
    this.datagrid.events.emit("onColumnSort", { column });
    this.applySort(column.columnId, "descending", column);
  }

  clearColumnSort(column: LeafColumn<any>): void {
    this.datagrid.events.emit("onColumnSort", { column });
    this.removeSortById(column.columnId, column);
  }

  applyAscendingSortByField(fieldId: string): void {
    this.applySort(fieldId, "ascending");
  }

  applyDescendingSortByField(fieldId: string): void {
    this.applySort(fieldId, "descending");
  }

  clearFieldSort(fieldId: string): void {
    this.removeSortById(fieldId);
  }

  addSort(sortId: string, direction?: DataTableActiveSortDirection): void {
    if (!this.isSortable(sortId)) {
      return;
    }

    this.datagrid.features.sorting.addSort(sortId, direction);
    this.refreshSorting(sortId);
  }

  removeSortAt(index: number): void {
    const sort = this.sorts[index];
    if (!sort) {
      return;
    }

    this.replaceSorts(
      this.sorts.filter((_, currentIndex) => currentIndex !== index),
      sort.sortId,
    );
  }

  setSorts(sorts: DataTableSort[]): void {
    this.replaceSorts(sorts);
  }

  updateSortDirection(index: number, direction: DataTableActiveSortDirection): void {
    const sort = this.sorts[index];
    if (!sort) {
      return;
    }

    this.replaceSorts(
      this.sorts.map((currentSort, currentIndex) =>
        currentIndex === index ? { ...currentSort, direction } : currentSort,
      ),
      sort.sortId,
    );
  }

  updateSortId(index: number, sortId: string): void {
    const sort = this.sorts[index];
    if (!sort || !this.isSortable(sortId)) {
      return;
    }

    this.replaceSorts(
      this.sorts.map((currentSort, currentIndex) =>
        currentIndex === index
          ? {
              ...currentSort,
              direction: this.datagrid.features.sorting.getSortDefaultDirection(sortId),
              sortId,
            }
          : currentSort,
      ),
      sortId,
    );
  }

  clearSorts(): void {
    this.datagrid.features.sorting.clearSorts();
    this.refreshSorting();
  }

  private applySort(sortId: string, direction: DataTableActiveSortDirection, column?: LeafColumn<any>): void {
    if (!this.isSortable(sortId)) {
      return;
    }

    const sorting = this.datagrid.features.sorting;
    if (sorting.getSort(sortId)) {
      sorting.updateSort(sortId, direction);
    } else {
      sorting.addSort(sortId, direction);
    }

    this.refreshSorting(sortId, column);
  }

  private removeSortById(sortId: string, column?: LeafColumn<any>): void {
    this.validateSort(sortId);
    this.datagrid.features.sorting.removeSort(sortId);
    this.refreshSorting(sortId, column);
  }

  private replaceSorts(sorts: DataTableSort[], sortId?: string): void {
    sorts.forEach((sort) => this.validateSort(sort.sortId));
    this.datagrid.features.sorting.setSorts(sorts);
    this.refreshSorting(sortId);
  }

  private isSortable(sortId: string): boolean {
    const definition = this.sortDefinitions.find((current) => current.sortId === sortId);
    if (definition) return true;

    const column = this.datagrid.columns.findColumnById(sortId);
    if (column?.type === "accessor" || column?.type === "computed") return column.options.sortable;

    throw new Error(`Sort ${sortId} not found`);
  }

  private validateSort(sortId: string): void {
    this.isSortable(sortId);
  }

  private getAlternateDirection(direction: DataTableActiveSortDirection): DataTableActiveSortDirection {
    return direction === "ascending" ? "descending" : "ascending";
  }

  private refreshSorting(sortId?: string, column?: LeafColumn<any>, multisort?: boolean): void {
    this.datagrid.cacheManager.invalidate("sortedData");
    this.datagrid.processors.data.executeFullDataTransformation();
    this.datagrid.features.sorting.onSortingChange(this.datagrid.features.sorting);
    this.datagrid.events.emit("onSortingChange", { column, multisort, sortId });
  }
}
