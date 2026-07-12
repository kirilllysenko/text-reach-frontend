import type {
  DataTableActiveSortDirection,
  DataTableSort,
  DataTableSortDefinition,
  LeafColumn,
  SortPanelController,
} from "../types";
import { BaseService } from "./base-service";

/**
 * Interface for sorting-related services in a data grid.
 */
export type ISortingService<TSortId extends string = string> = {
  toggleColumnSort(column: LeafColumn<any>, multisort: boolean): void;
  toggleSort(sortId: string, multisort: boolean): void;
  applyAscendingSort(column: LeafColumn<any>): void;
  applyDescendingSort(column: LeafColumn<any>): void;
  clearColumnSort(column: LeafColumn<any>): void;
  applyAscendingSortByField(fieldId: string): void;
  applyDescendingSortByField(fieldId: string): void;
  clearFieldSort(fieldId: string): void;
  addSort(sortId: TSortId, direction?: DataTableActiveSortDirection): void;
  removeSortAt(index: number): void;
  setSorts(sorts: DataTableSort<TSortId>[]): void;
  updateSortDirection(index: number, direction: DataTableActiveSortDirection): void;
  updateSortId(index: number, sortId: TSortId): void;
  clearSorts(): void;
};

/**
 * Class responsible for managing ordered sorting rules in a data grid.
 */
export class SortingService<TSortId extends string = string>
  extends BaseService<TSortId>
  implements ISortingService<TSortId>, SortPanelController<TSortId>
{
  get sorts(): DataTableSort<TSortId>[] {
    return this.datagrid.features.sorting.sorts;
  }

  get sortDefinitions(): readonly DataTableSortDefinition<TSortId>[] {
    return this.datagrid.features.sorting.sortDefinitions;
  }

  toggleColumnSort(column: LeafColumn<any>, multisort: boolean): void {
    this.datagrid.events.emit("onColumnSort", { column, multisort });
    this.toggleSort(column.columnId, multisort, column);
  }

  toggleSort(sortId: string, multisort: boolean, column?: LeafColumn<any>): void {
    const typedSortId = this.resolveSortId(sortId);
    if (!typedSortId) {
      return;
    }

    const sorting = this.datagrid.features.sorting;
    const sort = sorting.getSort(typedSortId);
    const useMultiSort = multisort && sorting.allowMultiSort;
    const defaultDirection = sorting.getSortDefaultDirection(typedSortId);
    const alternateDirection = this.getAlternateDirection(defaultDirection);

    if (!useMultiSort) {
      if (!sort) {
        sorting.setSorts([{ direction: defaultDirection, sortId: typedSortId }]);
      } else if (sort.direction === defaultDirection) {
        sorting.setSorts([{ direction: alternateDirection, sortId: typedSortId }]);
      } else {
        sorting.clearSorts();
      }

      this.refreshSorting(typedSortId, column, multisort);
      return;
    }

    if (!sort) {
      const nextSorts = sorting.sorts.slice();
      if (nextSorts.length >= sorting.maxMultiSortColumns) {
        nextSorts.shift();
      }

      sorting.setSorts([...nextSorts, { direction: defaultDirection, sortId: typedSortId }]);
    } else if (sort.direction === defaultDirection) {
      sorting.updateSort(typedSortId, alternateDirection);
    } else {
      sorting.removeSort(typedSortId);
    }

    this.refreshSorting(typedSortId, column, multisort);
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
    this.applyFieldSort(fieldId, "ascending");
  }

  applyDescendingSortByField(fieldId: string): void {
    this.applyFieldSort(fieldId, "descending");
  }

  clearFieldSort(fieldId: string): void {
    const typedSortId = this.resolveFieldSortId(fieldId);
    if (!typedSortId) {
      return;
    }

    this.datagrid.features.sorting.removeSort(typedSortId);
    this.refreshSorting(typedSortId);
  }

  addSort(sortId: TSortId, direction?: DataTableActiveSortDirection): void {
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

  setSorts(sorts: DataTableSort<TSortId>[]): void {
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

  updateSortId(index: number, sortId: TSortId): void {
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
    const typedSortId = this.resolveSortId(sortId);
    if (!typedSortId) {
      return;
    }

    const sorting = this.datagrid.features.sorting;
    if (sorting.getSort(typedSortId)) {
      sorting.updateSort(typedSortId, direction);
    } else {
      sorting.addSort(typedSortId, direction);
    }

    this.refreshSorting(typedSortId, column);
  }

  private applyFieldSort(fieldId: string, direction: DataTableActiveSortDirection): void {
    const typedSortId = this.resolveFieldSortId(fieldId);
    if (!typedSortId) {
      return;
    }

    const sorting = this.datagrid.features.sorting;
    if (sorting.getSort(typedSortId)) {
      sorting.updateSort(typedSortId, direction);
    } else {
      sorting.addSort(typedSortId, direction);
    }

    this.refreshSorting(typedSortId);
  }

  private removeSortById(sortId: string, column?: LeafColumn<any>): void {
    const typedSortId = this.resolveSortId(sortId);
    if (!typedSortId) {
      return;
    }

    this.datagrid.features.sorting.removeSort(typedSortId);
    this.refreshSorting(typedSortId, column);
  }

  private replaceSorts(sorts: DataTableSort<TSortId>[], sortId?: TSortId): void {
    if (!sorts.every((sort) => this.isSortable(sort.sortId))) {
      return;
    }

    this.datagrid.features.sorting.setSorts(sorts);
    this.refreshSorting(sortId);
  }

  private isSortable(sortId: TSortId): boolean {
    const fieldId = this.datagrid.features.sorting.getSortFieldId({ direction: "ascending", sortId });
    const field = this.datagrid.dataFields.findFieldById(fieldId);
    return field?.sortable !== false && Boolean(field);
  }

  private resolveSortId(sortId: string): TSortId | null {
    if (this.hasSortDefinition(sortId)) {
      const definition = this.sortDefinitions.find((currentDefinition) => currentDefinition.sortId === sortId);
      if (!definition) {
        return null;
      }

      return this.isSortableField(definition.fieldId ?? definition.sortId) ? definition.sortId : null;
    }

    if (this.sortDefinitions.length > 0 || !this.isSortableField(sortId)) {
      return null;
    }

    // Direct DatagridCore without definitions remains string-compatible after runtime field validation.
    return sortId as TSortId;
  }

  private resolveFieldSortId(fieldId: string): TSortId | null {
    const field = this.datagrid.dataFields.findFieldByIdOrThrow(fieldId);
    const definition = this.sortDefinitions.find(
      (currentDefinition) => (currentDefinition.fieldId ?? currentDefinition.sortId) === fieldId,
    );

    if (definition) {
      return field.sortable === false ? null : definition.sortId;
    }

    if (this.sortDefinitions.length > 0 || field.sortable === false) {
      return null;
    }

    // Direct DatagridCore without definitions remains string-compatible after runtime field validation.
    return fieldId as TSortId;
  }

  private hasSortDefinition(sortId: string): sortId is TSortId {
    return this.sortDefinitions.some((definition) => definition.sortId === sortId);
  }

  private isSortableField(fieldId: string): boolean {
    const field = this.datagrid.dataFields.findFieldById(fieldId);
    return Boolean(field && field.sortable !== false);
  }

  private getAlternateDirection(direction: DataTableActiveSortDirection): DataTableActiveSortDirection {
    return direction === "ascending" ? "descending" : "ascending";
  }

  private refreshSorting(sortId?: TSortId, column?: LeafColumn<any>, multisort?: boolean): void {
    this.datagrid.cacheManager.invalidate("sortedData");
    this.datagrid.processors.data.executeFullDataTransformation();
    this.datagrid.features.sorting.onSortingChange(this.datagrid.features.sorting);
    this.datagrid.events.emit("onSortingChange", { column, multisort, sortId });
  }
}
