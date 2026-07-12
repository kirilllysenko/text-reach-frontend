import type { DatagridCore } from "../index.svelte";
import type {
  DataTableActiveSortDirection,
  DataTableSort,
  DataTableSortDefinition,
  DataTableSortDirection,
} from "../types";

/**
 * Represents the state of the sorting feature in the datagrid.
 */
export type SortingFeatureState<TSortId extends string = string> = {
  sortDefinitions: readonly DataTableSortDefinition<TSortId>[];
  sorts: DataTableSort<TSortId>[];
  isManual: boolean;
  allowMultiSort: boolean;
  maxMultiSortColumns: number;
  onSortingChange: (config: SortingFeature<TSortId>) => void;
};

/**
 * Interface for methods related to the sorting feature.
 */
export type ISortingFeature<TSortId extends string = string> = {
  addSort(sortId: TSortId, direction?: DataTableActiveSortDirection): void;
  clearSorts(): void;
  getSort(sortId: TSortId): DataTableSort<TSortId> | undefined;
  getSortDefaultDirection(sortId: TSortId): DataTableActiveSortDirection;
  getSortDirection(sortId: TSortId): DataTableSortDirection;
  getSortFieldId(sort: DataTableSort<TSortId>): string;
  getSortIndex(sortId: TSortId): number | null;
  isSorted(sortId: TSortId, direction?: DataTableSortDirection): boolean;
  removeSort(sortId: TSortId): void;
  setSorts(sorts: DataTableSort<TSortId>[]): void;
  updateSort(sortId: TSortId, direction: DataTableActiveSortDirection): void;
} & SortingFeatureState<TSortId>;

/**
 * Configuration options for the sorting feature.
 */
export type SortingFeatureConfig<TSortId extends string = string> = Partial<SortingFeatureState<TSortId>>;

/**
 * Manages ordered sorting rules for the datagrid.
 */
export class SortingFeature<TSortId extends string = string> implements ISortingFeature<TSortId> {
  datagrid: DatagridCore<any, any, TSortId>;
  sortDefinitions: readonly DataTableSortDefinition<TSortId>[] = [];
  sorts: DataTableSort<TSortId>[] = $state([]);
  isManual: boolean = $state(false);
  allowMultiSort: boolean = $state(true);
  maxMultiSortColumns: number = $state(Infinity);
  onSortingChange: (config: SortingFeature<TSortId>) => void = () => {};

  constructor(datagrid: DatagridCore<any, any, TSortId>, config: SortingFeatureConfig<TSortId> = {}) {
    this.datagrid = datagrid;
    this.sortDefinitions = config.sortDefinitions ?? [];
    this.sorts = config.sorts ?? [];
    this.isManual = config.isManual ?? false;
    this.allowMultiSort = config.allowMultiSort ?? true;
    this.maxMultiSortColumns = config.maxMultiSortColumns ?? Infinity;
    this.onSortingChange = config.onSortingChange ?? (() => {});
  }

  getSort(sortId: TSortId): DataTableSort<TSortId> | undefined {
    return this.sorts.find((sort) => sort.sortId === sortId);
  }

  getSortByFieldId(fieldId: string): DataTableSort<TSortId> | undefined {
    return this.sorts.find((sort) => this.getSortFieldId(sort) === fieldId);
  }

  getSortIndex(sortId: TSortId): number | null {
    const index = this.findSortIndex(sortId);
    return index === -1 ? null : index + 1;
  }

  getSortConfigIndex(sortId: TSortId): number | null {
    return this.getSortIndex(sortId);
  }

  getSortConfigIndexByFieldId(fieldId: string): number | null {
    const sort = this.getSortByFieldId(fieldId);
    return sort ? this.getSortIndex(sort.sortId) : null;
  }

  getSortDirection(sortId: TSortId): DataTableSortDirection {
    return this.getSort(sortId)?.direction ?? "intermediate";
  }

  getSortDirectionByFieldId(fieldId: string): DataTableSortDirection {
    return this.getSortByFieldId(fieldId)?.direction ?? "intermediate";
  }

  setSorts(sorts: DataTableSort<TSortId>[]): void {
    this.sorts = this.normalizeSorts(sorts);
  }

  clearSorts(): void {
    this.sorts = [];
  }

  removeSort(sortId: TSortId): void {
    this.sorts = this.sorts.filter((sort) => sort.sortId !== sortId);
  }

  updateSort(sortId: TSortId, direction: DataTableActiveSortDirection): void {
    this.sorts = this.sorts.map((sort) => (sort.sortId === sortId ? { ...sort, direction } : sort));
  }

  addSort(sortId: TSortId, direction?: DataTableActiveSortDirection): void {
    const nextDirection = direction ?? this.getSortDefaultDirection(sortId);

    if (this.getSort(sortId)) {
      this.updateSort(sortId, nextDirection);
      return;
    }

    if (this.sorts.length >= this.maxMultiSortColumns) {
      return;
    }

    this.sorts = [...this.sorts, { direction: nextDirection, sortId }];
  }

  isSorted(sortId: TSortId, direction?: DataTableSortDirection): boolean {
    const sort = this.getSort(sortId);
    if (!direction) return Boolean(sort);

    return sort?.direction === direction;
  }

  getSortFieldId(sort: DataTableSort<TSortId>): string {
    return this.sortDefinitions.find((definition) => definition.sortId === sort.sortId)?.fieldId ?? sort.sortId;
  }

  getSortDefaultDirection(sortId: TSortId): DataTableActiveSortDirection {
    return this.sortDefinitions.find((definition) => definition.sortId === sortId)?.defaultDirection ?? "ascending";
  }

  // Compatibility aliases for existing column-header call sites.
  isColumnSorted(sortId: TSortId, direction?: DataTableSortDirection): boolean {
    return this.isSorted(sortId, direction);
  }

  findSortConfigIndex(sortId: TSortId): number {
    return this.findSortIndex(sortId);
  }

  private findSortIndex(sortId: TSortId): number {
    return this.sorts.findIndex((sort) => sort.sortId === sortId);
  }

  private normalizeSorts(sorts: DataTableSort<TSortId>[]): DataTableSort<TSortId>[] {
    if (this.allowMultiSort) {
      return sorts.slice(0, this.maxMultiSortColumns);
    }

    return sorts.slice(0, 1);
  }
}
