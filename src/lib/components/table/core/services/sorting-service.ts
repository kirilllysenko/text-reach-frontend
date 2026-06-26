import type { LeafColumn } from "../types";
import { BaseService } from "./base-service";

/**
 * Interface for sorting-related services in a data grid.
 */
export type ISortingService = {
  /**
   * Toggles the sorting of a column.
   *
   * @param {LeafColumn<any>} column The column to toggle sort for.
   * @param {boolean} multisort Whether to apply multi-column sorting.
   */
  toggleColumnSort(column: LeafColumn<any>, multisort: boolean): void;

  /**
   * Applies an ascending sort to a column.
   *
   * @param {LeafColumn<any>} column The column to apply ascending sort to.
   */
  applyAscendingSort(column: LeafColumn<any>): void;

  /**
   * Applies a descending sort to a column.
   *
   * @param {LeafColumn<any>} column The column to apply descending sort to.
   */
  applyDescendingSort(column: LeafColumn<any>): void;

  /**
   * Clears the sort for a given column.
   *
   * @param {LeafColumn<any>} column The column to clear the sort for.
   */
  clearColumnSort(column: LeafColumn<any>): void;

  toggleFieldSort(fieldId: string, multisort: boolean): void;

  applyAscendingSortByField(fieldId: string): void;

  applyDescendingSortByField(fieldId: string): void;

  clearFieldSort(fieldId: string): void;
};

/**
 * Class responsible for managing column sorting in a data grid.
 *
 * @extends BaseService
 */
export class SortingService extends BaseService {
  /**
   * Toggles the sorting direction of a column (ascending/descending) or clears the sort.
   *
   * @param {LeafColumn<any>} column The column to toggle sort for.
   * @param {boolean} multisort Whether to apply multi-column sorting.
   */
  toggleColumnSort(column: LeafColumn<any>, multisort: boolean) {
    this.datagrid.events.emit("onColumnSort", { column, multisort });
    this.toggleFieldSort(column.columnId, multisort);
  }

  /**
   * Toggles sorting for a data field, including fields that do not have a rendered column.
   *
   * @param {string} fieldId The field to toggle sort for.
   * @param {boolean} multisort Whether to apply multi-field sorting.
   */
  toggleFieldSort(fieldId: string, multisort: boolean) {
    const datagrid = this.datagrid;
    const field = datagrid.dataFields.findFieldByIdOrThrow(fieldId);

    if (field.sortable === false) return;

    const isFieldSorted = datagrid.features.sorting.isColumnSorted(fieldId);
    const isFieldSortedAscending = datagrid.features.sorting.isColumnSorted(fieldId, "ascending");

    const applySingleFieldSort = () => {
      if (!isFieldSorted) {
        this.datagrid.features.sorting.clearSortConfigs();
        this.datagrid.features.sorting.addSortConfig(fieldId, "ascending");
      } else if (isFieldSortedAscending) {
        this.datagrid.features.sorting.clearSortConfigs();
        datagrid.features.sorting.addSortConfig(fieldId, "descending");
      } else this.datagrid.features.sorting.clearSortConfigs();
    };

    const applyMultiFieldSort = () => {
      if (!isFieldSorted) {
        const isOverMaxColCount =
          datagrid.features.sorting.sortConfigs.length >= datagrid.features.sorting.maxMultiSortColumns;
        if (isOverMaxColCount) {
          // remove first sorting config
          if (datagrid.features.sorting.sortConfigs.length > 0) {
            datagrid.features.sorting.removeSortConfig(
              datagrid.features.sorting.getSortConfigFieldId(datagrid.features.sorting.sortConfigs[0]!),
            );
          }
        }

        datagrid.features.sorting.addSortConfig(fieldId, "ascending");
      } else if (isFieldSortedAscending) {
        datagrid.features.sorting.changeSortConfigDirection(fieldId, "descending");
      } else {
        datagrid.features.sorting.removeSortConfig(fieldId);
      }
    };

    if (multisort) applyMultiFieldSort();
    else applySingleFieldSort();

    datagrid.cacheManager.invalidate("sortedData");
    datagrid.processors.data.executeFullDataTransformation();
    datagrid.features.sorting.onSortingChange(datagrid.features.sorting);
  }

  /**
   * Applies an ascending sort to the specified column.
   *
   * @param {LeafColumn<any>} column The column to apply ascending sort to.
   */
  applyAscendingSort(column: LeafColumn<any>) {
    this.datagrid.events.emit("onColumnSort", { column });
    this.applyAscendingSortByField(column.columnId);
  }

  /**
   * Applies an ascending sort to the specified data field.
   *
   * @param {string} fieldId The field to apply ascending sort to.
   */
  applyAscendingSortByField(fieldId: string) {
    const field = this.datagrid.dataFields.findFieldByIdOrThrow(fieldId);
    if (field.sortable === false) return;

    const isFieldSorted = this.datagrid.features.sorting.isColumnSorted(fieldId);
    if (isFieldSorted) this.datagrid.features.sorting.changeSortConfigDirection(fieldId, "ascending");
    else this.datagrid.features.sorting.addSortConfig(fieldId, "ascending");

    this.datagrid.processors.data.executeFullDataTransformation();
  }

  /**
   * Applies a descending sort to the specified column.
   *
   * @param {LeafColumn<any>} column The column to apply descending sort to.
   */
  applyDescendingSort(column: LeafColumn<any>) {
    this.datagrid.events.emit("onColumnSort", { column });
    this.applyDescendingSortByField(column.columnId);
  }

  /**
   * Applies a descending sort to the specified data field.
   *
   * @param {string} fieldId The field to apply descending sort to.
   */
  applyDescendingSortByField(fieldId: string) {
    const field = this.datagrid.dataFields.findFieldByIdOrThrow(fieldId);
    if (field.sortable === false) return;

    const isFieldSorted = this.datagrid.features.sorting.isColumnSorted(fieldId);
    if (isFieldSorted) this.datagrid.features.sorting.changeSortConfigDirection(fieldId, "descending");
    else this.datagrid.features.sorting.addSortConfig(fieldId, "descending");

    this.datagrid.processors.data.executeFullDataTransformation();
  }

  /**
   * Clears the sort configuration for a specified column.
   *
   * @param {LeafColumn<any>} column The column to clear the sort for.
   */
  clearColumnSort(column: LeafColumn<any>) {
    this.datagrid.events.emit("onColumnSort", { column });
    this.clearFieldSort(column.columnId);
  }

  /**
   * Clears the sort configuration for a specified data field.
   *
   * @param {string} fieldId The field to clear sort for.
   */
  clearFieldSort(fieldId: string) {
    this.datagrid.dataFields.findFieldByIdOrThrow(fieldId);
    this.datagrid.features.sorting.removeSortConfig(fieldId);
    this.datagrid.processors.data.executeFullDataTransformation();
  }
}
