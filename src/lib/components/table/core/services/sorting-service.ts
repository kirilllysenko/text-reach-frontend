import type { LeafColumn } from "../column-types";
import type {
  DataTableActiveSortDirection,
  DataTableSort,
  DataTableSortDefinition,
  SortingFeature,
} from "../features/sorting.svelte";
import { BaseService } from "./base-service";

export type ISortingService<TSort = DataTableSort> = {
  addSort(sortId: string, direction?: DataTableActiveSortDirection): void;
  applyAscendingSort(column: LeafColumn<any>): void;
  applyAscendingSortByField(fieldId: string): void;
  applyDescendingSort(column: LeafColumn<any>): void;
  applyDescendingSortByField(fieldId: string): void;
  clearColumnSort(column: LeafColumn<any>): void;
  clearFieldSort(fieldId: string): void;
  clearSorts(): void;
  getSortDirection(sort: TSort): DataTableActiveSortDirection;
  getSortId(sort: TSort): string;
  removeSortAt(index: number): void;
  setSorts(sorts: TSort[]): void;
  toggleColumnSort(column: LeafColumn<any>, multisort: boolean): void;
  toggleSort(sortId: string, multisort: boolean): void;
  updateSortDirection(index: number, direction: DataTableActiveSortDirection): void;
  updateSortId(index: number, sortId: string): void;
};

export class SortingService<TSort = DataTableSort> extends BaseService {
  get sorts(): TSort[] {
    return this.sorting.sorts;
  }

  get sortDefinitions(): readonly DataTableSortDefinition<string, any, TSort>[] {
    return this.sorting.sortDefinitions;
  }

  getSortId(sort: TSort): string {
    return this.sorting.getSortId(sort);
  }

  getSortDirection(sort: TSort): DataTableActiveSortDirection {
    return this.sorting.getActiveSortDirection(sort);
  }

  toggleColumnSort(column: LeafColumn<any>, multisort: boolean): void {
    this.datagrid.events.emit("onColumnSort", { column, multisort });
    this.toggleSort(column.columnId, multisort, column);
  }

  toggleSort(sortId: string, multisort: boolean, column?: LeafColumn<any>): void {
    if (!this.isSortable(sortId)) {
      return;
    }

    const sort = this.sorting.getSort(sortId);
    const useMultiSort = multisort && this.sorting.allowMultiSort;
    const defaultDirection = this.sorting.getSortDefaultDirection(sortId);
    const alternateDirection = this.getAlternateDirection(defaultDirection);

    if (!useMultiSort) {
      if (!sort) {
        this.sorting.setSorts([this.sorting.createSort(sortId, defaultDirection)]);
      } else if (this.sorting.getActiveSortDirection(sort) === defaultDirection) {
        this.sorting.setSorts([this.sorting.createSort(sortId, alternateDirection)]);
      } else {
        this.sorting.clearSorts();
      }

      this.refreshSorting(sortId, column, multisort);
      return;
    }

    if (!sort) {
      const nextSorts = this.sorting.sorts.slice();
      if (nextSorts.length >= this.sorting.maxMultiSortColumns) {
        nextSorts.shift();
      }

      this.sorting.setSorts([...nextSorts, this.sorting.createSort(sortId, defaultDirection)]);
    } else if (this.sorting.getActiveSortDirection(sort) === defaultDirection) {
      this.sorting.updateSort(sortId, alternateDirection);
    } else {
      this.sorting.removeSort(sortId);
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

    this.sorting.addSort(sortId, direction);
    this.refreshSorting(sortId);
  }

  removeSortAt(index: number): void {
    const sort = this.sorts[index];
    if (!sort) {
      return;
    }

    this.replaceSorts(
      this.sorts.filter((_, currentIndex) => currentIndex !== index),
      this.getSortId(sort),
    );
  }

  setSorts(sorts: TSort[]): void {
    this.replaceSorts(sorts);
  }

  updateSortDirection(index: number, direction: DataTableActiveSortDirection): void {
    const sort = this.sorts[index];
    if (!sort) {
      return;
    }

    const sortId = this.getSortId(sort);
    this.replaceSorts(
      this.sorts.map((currentSort, currentIndex) =>
        currentIndex === index ? this.sorting.createSort(sortId, direction) : currentSort,
      ),
      sortId,
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
          ? this.sorting.createSort(sortId, this.sorting.getSortDefaultDirection(sortId))
          : currentSort,
      ),
      sortId,
    );
  }

  clearSorts(): void {
    this.sorting.clearSorts();
    this.refreshSorting();
  }

  private get sorting(): SortingFeature<TSort> {
    return this.datagrid.features.sorting as SortingFeature<TSort>;
  }

  private applySort(sortId: string, direction: DataTableActiveSortDirection, column?: LeafColumn<any>): void {
    if (!this.isSortable(sortId)) {
      return;
    }

    if (this.sorting.getSort(sortId)) {
      this.sorting.updateSort(sortId, direction);
    } else {
      this.sorting.addSort(sortId, direction);
    }

    this.refreshSorting(sortId, column);
  }

  private removeSortById(sortId: string, column?: LeafColumn<any>): void {
    this.validateSort(sortId);
    this.sorting.removeSort(sortId);
    this.refreshSorting(sortId, column);
  }

  private replaceSorts(sorts: TSort[], sortId?: string): void {
    sorts.forEach((sort) => this.validateSort(this.getSortId(sort)));
    this.sorting.setSorts(sorts);
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
    this.sorting.onSortingChange(this.sorting);
    this.datagrid.events.emit("onSortingChange", { column, multisort, sortId });
  }
}
