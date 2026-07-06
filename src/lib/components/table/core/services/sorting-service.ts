import type { DataTableActiveSortDirection, DataTableSort, LeafColumn } from "../types";
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
  removeSort(sortId: string): void;
  clearSorts(): void;
};

/**
 * Class responsible for managing ordered sorting rules in a data grid.
 */
export class SortingService extends BaseService {
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

    if (!useMultiSort) {
      if (!sort) {
        sorting.setSorts([{ direction: "ascending", sortId }]);
      } else if (sort.direction === "ascending") {
        sorting.setSorts([{ direction: "descending", sortId }]);
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

      sorting.setSorts([...nextSorts, { direction: "ascending", sortId }]);
    } else if (sort.direction === "ascending") {
      sorting.updateSort(sortId, "descending");
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
    this.removeSort(column.columnId, column);
  }

  applyAscendingSortByField(fieldId: string): void {
    this.applySort(fieldId, "ascending");
  }

  applyDescendingSortByField(fieldId: string): void {
    this.applySort(fieldId, "descending");
  }

  clearFieldSort(fieldId: string): void {
    this.removeSort(fieldId);
  }

  removeSort(sortId: string, column?: LeafColumn<any>): void {
    this.validateSort(sortId);
    this.datagrid.features.sorting.removeSort(sortId);
    this.refreshSorting(sortId, column);
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

  private isSortable(sortId: string): boolean {
    const field = this.validateSort(sortId);
    return field.sortable !== false;
  }

  private validateSort(sortId: string) {
    const sort = { direction: "ascending", sortId } satisfies DataTableSort;
    const fieldId = this.datagrid.features.sorting.getSortFieldId(sort);
    return this.datagrid.dataFields.findFieldByIdOrThrow(fieldId);
  }

  private refreshSorting(sortId?: string, column?: LeafColumn<any>, multisort?: boolean): void {
    this.datagrid.cacheManager.invalidate("sortedData");
    this.datagrid.processors.data.executeFullDataTransformation();
    this.datagrid.features.sorting.onSortingChange(this.datagrid.features.sorting);
    this.datagrid.events.emit("onSortingChange", { column, multisort, sortId });
  }
}
