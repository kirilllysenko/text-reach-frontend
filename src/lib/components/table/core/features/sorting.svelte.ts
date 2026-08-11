import type { DatagridCore } from "../index.svelte";
import type { GetValueFn } from "../data-types";

export type SortingDirection = "ascending" | "descending" | "intermediate";
export type DataTableSortDirection = SortingDirection;
export type DataTableActiveSortDirection = Exclude<DataTableSortDirection, "intermediate">;

export interface DataTableSort<TSortId extends string = string> {
  direction: DataTableActiveSortDirection;
  sortId: TSortId;
}

export interface DataTableSortDefinition<
  TSortId extends string = string,
  TOriginalRow = any,
  TSort = DataTableSort<TSortId>,
> {
  createSort?(direction: DataTableActiveSortDirection): TSort;
  defaultDirection?: DataTableActiveSortDirection;
  fieldId?: string;
  getDirection?(sort: TSort): DataTableActiveSortDirection;
  getValueFn?: GetValueFn<TOriginalRow>;
  isSort?(sort: TSort): boolean;
  label?: string;
  sortId: TSortId;
}

export type DataTableSortDefinitionWithDefault<
  TSortId extends string = string,
  TOriginalRow = any,
  TSort = DataTableSort<TSortId>,
> = DataTableSortDefinition<TSortId, TOriginalRow, TSort> & {
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

export type SortingFeatureState<TSort = DataTableSort> = {
  allowMultiSort: boolean;
  isManual: boolean;
  maxMultiSortColumns: number;
  onSortingChange: (config: SortingFeature<TSort>) => void;
  sortDefinitions: readonly DataTableSortDefinition<string, any, TSort>[];
  sorts: TSort[];
};

export type ISortingFeature<TSort = DataTableSort> = {
  addSort(sortId: string, direction?: DataTableActiveSortDirection): void;
  clearSorts(): void;
  createSort(sortId: string, direction: DataTableActiveSortDirection): TSort;
  getActiveSortDirection(sort: TSort): DataTableActiveSortDirection;
  getSort(sortId: string): TSort | undefined;
  getSortDefaultDirection(sortId: string): DataTableActiveSortDirection;
  getSortDirection(sortId: string): DataTableSortDirection;
  getSortFieldId(sort: TSort): string;
  getSortId(sort: TSort): string;
  getSortIndex(sortId: string): number | null;
  getSortValueGetter(sort: TSort): GetValueFn<any>;
  isSorted(sortId: string, direction?: DataTableSortDirection): boolean;
  removeSort(sortId: string): void;
  setSorts(sorts: TSort[]): void;
  updateSort(sortId: string, direction: DataTableActiveSortDirection): void;
} & SortingFeatureState<TSort>;

export type SortingFeatureConfig<TSort = DataTableSort> = Partial<SortingFeatureState<TSort>>;

export class SortingFeature<TSort = DataTableSort> implements ISortingFeature<TSort> {
  datagrid: DatagridCore<any, any>;
  sortDefinitions: readonly DataTableSortDefinition<string, any, TSort>[] = [];
  sorts: TSort[] = $state([]);
  isManual: boolean = $state(false);
  allowMultiSort: boolean = $state(true);
  maxMultiSortColumns: number = $state(Infinity);
  onSortingChange: (config: SortingFeature<TSort>) => void = () => {};

  constructor(datagrid: DatagridCore<any, any>, config: SortingFeatureConfig<TSort> = {}) {
    this.datagrid = datagrid;
    this.sortDefinitions = config.sortDefinitions ?? [];
    this.sorts = config.sorts ?? [];
    this.isManual = config.isManual ?? false;
    this.allowMultiSort = config.allowMultiSort ?? true;
    this.maxMultiSortColumns = config.maxMultiSortColumns ?? Infinity;
    this.onSortingChange = config.onSortingChange ?? (() => {});
  }

  getSort(sortId: string): TSort | undefined {
    return this.sorts.find((sort) => this.getSortId(sort) === sortId);
  }

  getSortIndex(sortId: string): number | null {
    const index = this.sorts.findIndex((sort) => this.getSortId(sort) === sortId);
    return index === -1 ? null : index + 1;
  }

  getSortDirection(sortId: string): DataTableSortDirection {
    const sort = this.getSort(sortId);
    return sort ? this.getActiveSortDirection(sort) : "intermediate";
  }

  getSortId(sort: TSort): string {
    const definition = this.getDefinitionForSort(sort);
    if (definition) {
      return definition.sortId;
    }

    const sortId = (sort as DataTableSort).sortId;
    if (typeof sortId === "string") {
      return sortId;
    }

    throw new Error("Sort does not match a definition");
  }

  getActiveSortDirection(sort: TSort): DataTableActiveSortDirection {
    const definition = this.getDefinitionForSort(sort);
    if (definition?.getDirection) {
      return definition.getDirection(sort);
    }

    const direction = (sort as DataTableSort).direction;
    if (direction === "ascending" || direction === "descending") {
      return direction;
    }

    throw new Error(`Sort ${this.getSortId(sort)} does not define a direction`);
  }

  createSort(sortId: string, direction: DataTableActiveSortDirection): TSort {
    const definition = this.getDefinition(sortId);
    return definition?.createSort ? definition.createSort(direction) : ({ direction, sortId } as TSort);
  }

  setSorts(sorts: TSort[]): void {
    this.sorts = this.normalizeSorts(sorts);
  }

  clearSorts(): void {
    this.sorts = [];
  }

  removeSort(sortId: string): void {
    this.sorts = this.sorts.filter((sort) => this.getSortId(sort) !== sortId);
  }

  updateSort(sortId: string, direction: DataTableActiveSortDirection): void {
    this.sorts = this.sorts.map((sort) =>
      this.getSortId(sort) === sortId ? this.createSort(sortId, direction) : sort,
    );
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

    this.sorts = [...this.sorts, this.createSort(sortId, nextDirection)];
  }

  isSorted(sortId: string, direction?: DataTableSortDirection): boolean {
    const sort = this.getSort(sortId);
    if (!direction) return Boolean(sort);

    return sort ? this.getActiveSortDirection(sort) === direction : false;
  }

  getSortFieldId(sort: TSort): string {
    const definition = this.getDefinitionForSort(sort);
    return definition?.fieldId ?? definition?.sortId ?? this.getSortId(sort);
  }

  getSortValueGetter(sort: TSort): GetValueFn<any> {
    const definition = this.getDefinitionForSort(sort);
    if (definition?.getValueFn) return definition.getValueFn;

    const fieldId = definition?.fieldId ?? definition?.sortId ?? this.getSortId(sort);
    const column = this.datagrid.columns.findColumnById(fieldId);
    if (column?.type === "accessor" || column?.type === "computed") return column.getValueFn;

    throw new Error(`Sort ${this.getSortId(sort)} has no local value getter`);
  }

  getSortDefaultDirection(sortId: string): DataTableActiveSortDirection {
    return this.getDefinition(sortId)?.defaultDirection ?? "ascending";
  }

  private getDefinition(sortId: string): DataTableSortDefinition<string, any, TSort> | undefined {
    return this.sortDefinitions.find((definition) => definition.sortId === sortId);
  }

  private getDefinitionForSort(sort: TSort): DataTableSortDefinition<string, any, TSort> | undefined {
    const adaptedDefinition = this.sortDefinitions.find((definition) => definition.isSort?.(sort));
    if (adaptedDefinition) {
      return adaptedDefinition;
    }

    const sortId = (sort as DataTableSort).sortId;
    return typeof sortId === "string" ? this.getDefinition(sortId) : undefined;
  }

  private normalizeSorts(sorts: TSort[]): TSort[] {
    if (this.allowMultiSort) {
      return sorts.slice(0, this.maxMultiSortColumns);
    }

    return sorts.slice(0, 1);
  }
}
