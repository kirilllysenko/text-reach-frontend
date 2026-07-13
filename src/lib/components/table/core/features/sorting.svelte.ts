import type { DatagridCore } from "../index.svelte";
import type { GetValueFn } from "../data-types";

export type SortingDirection = "ascending" | "descending" | "intermediate";
export type DataTableSortDirection = SortingDirection;
export type DataTableActiveSortDirection = Exclude<DataTableSortDirection, "intermediate">;

export interface DataTableSort<TSortId extends string = string> {
  direction: DataTableActiveSortDirection;
  sortId: TSortId;
}

export interface DataTableSortDefinition<TSortId extends string = string, TOriginalRow = any> {
  defaultDirection?: DataTableActiveSortDirection;
  fieldId?: string;
  getValueFn?: GetValueFn<TOriginalRow>;
  label?: string;
  sortId: TSortId;
}

export type DataTableSortDefinitionWithDefault<
  TSortId extends string = string,
  TOriginalRow = any,
> = DataTableSortDefinition<TSortId, TOriginalRow> & {
  defaultDirection: DataTableActiveSortDirection;
};

export type DataTableSortFromDefinition<TDefinition> =
  TDefinition extends DataTableSortDefinition<infer TSortId> ? DataTableSort<TSortId> : never;

export type DataTableSortFromDefinitions<TDefinitions extends readonly DataTableSortDefinition[]> =
  DataTableSortFromDefinition<TDefinitions[number]>;

export function sortDefinition<const TSortId extends string, TOriginalRow = any>(
  definition: DataTableSortDefinition<TSortId, TOriginalRow>,
): DataTableSortDefinitionWithDefault<TSortId, TOriginalRow> {
  return { defaultDirection: "ascending", ...definition };
}

/**
 * Represents the state of the sorting feature in the datagrid.
 */
export type SortingFeatureState<TSort extends DataTableSort = DataTableSort> = {
  sortDefinitions: readonly DataTableSortDefinition[];
  sorts: TSort[];
  isManual: boolean;
  allowMultiSort: boolean;
  maxMultiSortColumns: number;
  onSortingChange: (config: SortingFeature) => void;
};

/**
 * Interface for methods related to the sorting feature.
 */
export type ISortingFeature = {
  addSort(sortId: string, direction?: DataTableActiveSortDirection): void;
  clearSorts(): void;
  getSort(sortId: string): DataTableSort | undefined;
  getSortDefaultDirection(sortId: string): DataTableActiveSortDirection;
  getSortDirection(sortId: string): DataTableSortDirection;
  getSortFieldId(sort: DataTableSort): string;
  getSortValueGetter(sort: DataTableSort): GetValueFn<any>;
  getSortIndex(sortId: string): number | null;
  isSorted(sortId: string, direction?: DataTableSortDirection): boolean;
  removeSort(sortId: string): void;
  setSorts(sorts: DataTableSort[]): void;
  updateSort(sortId: string, direction: DataTableActiveSortDirection): void;
} & SortingFeatureState;

/**
 * Configuration options for the sorting feature.
 */
export type SortingFeatureConfig<TSort extends DataTableSort = DataTableSort> = Partial<SortingFeatureState<TSort>>;

/**
 * Manages ordered sorting rules for the datagrid.
 */
export class SortingFeature<TSort extends DataTableSort = DataTableSort> implements ISortingFeature {
  datagrid: DatagridCore<any>;
  sortDefinitions: readonly DataTableSortDefinition[] = [];
  sorts: TSort[] = $state([]);
  isManual: boolean = $state(false);
  allowMultiSort: boolean = $state(true);
  maxMultiSortColumns: number = $state(Infinity);
  onSortingChange: (config: SortingFeature) => void = () => {};

  constructor(datagrid: DatagridCore<any>, config: SortingFeatureConfig<TSort> = {}) {
    this.datagrid = datagrid;
    this.sortDefinitions = config.sortDefinitions ?? [];
    this.sorts = config.sorts ?? [];
    this.isManual = config.isManual ?? false;
    this.allowMultiSort = config.allowMultiSort ?? true;
    this.maxMultiSortColumns = config.maxMultiSortColumns ?? Infinity;
    this.onSortingChange = config.onSortingChange ?? (() => {});
  }

  getSort(sortId: string): TSort | undefined {
    return this.sorts.find((sort) => sort.sortId === sortId);
  }

  getSortIndex(sortId: string): number | null {
    const index = this.findSortIndex(sortId);
    return index === -1 ? null : index + 1;
  }

  getSortDirection(sortId: string): DataTableSortDirection {
    return this.getSort(sortId)?.direction ?? "intermediate";
  }

  setSorts(sorts: TSort[]): void {
    this.sorts = this.normalizeSorts(sorts);
  }

  clearSorts(): void {
    this.sorts = [];
  }

  removeSort(sortId: string): void {
    this.sorts = this.sorts.filter((sort) => sort.sortId !== sortId);
  }

  updateSort(sortId: string, direction: DataTableActiveSortDirection): void {
    this.sorts = this.sorts.map((sort) => (sort.sortId === sortId ? { ...sort, direction } : sort));
  }

  addSort(sortId: string, direction?: DataTableActiveSortDirection): void {
    const nextDirection = direction ?? this.getSortDefaultDirection(sortId);

    if (this.getSort(sortId)) {
      this.updateSort(sortId, nextDirection);
      return;
    }

    if (this.sorts.length >= this.maxMultiSortColumns) {
      return;
    }

    this.sorts = [...this.sorts, { direction: nextDirection, sortId } as TSort];
  }

  isSorted(sortId: string, direction?: DataTableSortDirection): boolean {
    const sort = this.getSort(sortId);
    if (!direction) return Boolean(sort);

    return sort?.direction === direction;
  }

  getSortFieldId(sort: DataTableSort): string {
    return this.sortDefinitions.find((definition) => definition.sortId === sort.sortId)?.fieldId ?? sort.sortId;
  }

  getSortValueGetter(sort: DataTableSort): GetValueFn<any> {
    const definition = this.sortDefinitions.find((current) => current.sortId === sort.sortId);
    if (definition?.getValueFn) return definition.getValueFn;

    const fieldId = definition?.fieldId ?? sort.sortId;
    const column = this.datagrid.columns.findColumnById(fieldId);
    if (column?.type === "accessor" || column?.type === "computed") return column.getValueFn;

    throw new Error(`Sort ${sort.sortId} has no local value getter`);
  }

  getSortDefaultDirection(sortId: string): DataTableActiveSortDirection {
    return this.sortDefinitions.find((definition) => definition.sortId === sortId)?.defaultDirection ?? "ascending";
  }

  private findSortIndex(sortId: string): number {
    return this.sorts.findIndex((sort) => sort.sortId === sortId);
  }

  private normalizeSorts(sorts: TSort[]): TSort[] {
    if (this.allowMultiSort) {
      return sorts.slice(0, this.maxMultiSortColumns);
    }

    return sorts.slice(0, 1);
  }
}
