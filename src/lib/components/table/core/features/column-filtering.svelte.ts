import type { DatagridCore } from "../index.svelte";
import type { DataTableFilter, DataTableFilterDefinition } from "../types";

export type ColumnFilteringState<TFilter extends DataTableFilter = DataTableFilter> = {
  filterDefinitions: readonly DataTableFilterDefinition[];
  filters: Map<string, TFilter> | TFilter[];
  isManual: boolean;
};

export type ColumnFilteringFeatureConfig<TFilter extends DataTableFilter = DataTableFilter> = Partial<
  ColumnFilteringState<TFilter>
>;
export type IColumnFilteringFeature = ColumnFilteringFeature;

/**
 * Manages active table filters using the shared DataTableFilter shape.
 */
export class ColumnFilteringFeature<
  TOriginalRow = any,
  TFilter extends DataTableFilter = DataTableFilter,
> implements IColumnFilteringFeature {
  datagrid: DatagridCore;

  filterDefinitions: readonly DataTableFilterDefinition[] = [];
  isManual: boolean = $state(false);

  private filtersById = $state.raw(new Map<string, TFilter>());

  constructor(datagrid: DatagridCore, config: ColumnFilteringFeatureConfig<TFilter> = {}) {
    this.datagrid = datagrid;
    this.filterDefinitions = config.filterDefinitions ?? [];
    this.isManual = config.isManual ?? false;

    if (config.filters) {
      this.replaceFilters(config.filters);
    }
  }

  get filters(): TFilter[] {
    return Array.from(this.filtersById.values());
  }

  get filterMap(): ReadonlyMap<string, TFilter> {
    return this.filtersById;
  }

  getFilter<TCurrentFilter extends TFilter = TFilter>(filterId: string): TCurrentFilter | null {
    return (this.filtersById.get(filterId) as TCurrentFilter | undefined) ?? null;
  }

  getFilterValue(filterId: string): TFilter["value"] | null {
    return this.getFilter(filterId)?.value ?? null;
  }

  getFilterOperator(filterId: string): TFilter["operator"] | null {
    return this.getFilter(filterId)?.operator ?? null;
  }

  setFilter(filterId: string, filter: TFilter): void {
    this.assertFilterDefinition(filterId, filter);

    const nextFilters = new Map(this.filtersById);
    nextFilters.set(filterId, { ...filter, filterId });
    this.filtersById = nextFilters;
  }

  removeFilter(filterId: string): void {
    if (!this.filtersById.has(filterId)) {
      return;
    }

    const nextFilters = new Map(this.filtersById);
    nextFilters.delete(filterId);
    this.filtersById = nextFilters;
  }

  clearFilters(): void {
    if (this.filtersById.size === 0) {
      return;
    }

    this.filtersById = new Map();
  }

  replaceFilters(filters: Map<string, TFilter> | TFilter[]): void {
    const nextFilters = new Map<string, TFilter>();

    if (Array.isArray(filters)) {
      filters.forEach((filter) => {
        this.assertFilterDefinition(filter.filterId, filter);
        nextFilters.set(filter.filterId, filter);
      });
    } else {
      filters.forEach((filter, filterId) => {
        this.assertFilterDefinition(filterId, filter);
        nextFilters.set(filterId, { ...filter, filterId });
      });
    }

    this.filtersById = nextFilters;
  }

  getFilterFieldId(filter: DataTableFilter): string {
    return (
      this.filterDefinitions.find((definition) => definition.filterId === filter.filterId)?.fieldId ?? filter.filterId
    );
  }

  evaluateFilter(cellValue: unknown, filter: DataTableFilter): boolean {
    if (filter.type === "text") {
      const value = filter.value?.toLowerCase() ?? "";
      const textValue = String(cellValue ?? "").toLowerCase();

      switch (filter.operator) {
        case "CONTAINS":
          return textValue.includes(value);
        case "NOT_CONTAINS":
          return !textValue.includes(value);
        case "STARTS_WITH":
          return textValue.startsWith(value);
        case "ENDS_WITH":
          return textValue.endsWith(value);
        case "EQUAL":
          return textValue === value;
        case "NOT_EQUAL":
          return textValue !== value;
      }
    }

    if (filter.type === "comparison") {
      const value = filter.value;
      const comparableCellValue = cellValue as string | number;
      const comparableValue = value as string | number;

      switch (filter.operator) {
        case "EQUAL":
          return cellValue === value;
        case "NOT_EQUAL":
          return cellValue !== value;
        case "GREATER_THAN":
          return comparableCellValue > comparableValue;
        case "LESS_THAN":
          return comparableCellValue < comparableValue;
        case "GREATER_OR_EQUAL":
          return comparableCellValue >= comparableValue;
        case "LESS_OR_EQUAL":
          return comparableCellValue <= comparableValue;
      }
    }

    const selectedValues = new Set(filter.value);
    const cellValues = Array.isArray(cellValue) ? cellValue : [cellValue];
    const matches = cellValues.some((value) => selectedValues.has(String(value)));

    return filter.operator === "IN" ? matches : !matches;
  }

  isFilterActive(filter: DataTableFilter): boolean {
    if (filter.type === "text") {
      return Boolean(filter.value?.trim());
    }

    if (filter.type === "comparison") {
      return typeof filter.value !== "undefined";
    }

    return filter.value.length > 0;
  }

  private assertFilterDefinition(filterId: string, filter: DataTableFilter): void {
    if (filter.filterId !== filterId) {
      throw new Error(`Filter id ${filter.filterId} does not match target filter id ${filterId}`);
    }

    const definition = this.filterDefinitions.find((current) => current.filterId === filterId);
    if (definition && definition.type !== filter.type) {
      throw new Error(`Filter ${filterId} must be a ${definition.type} filter`);
    }
  }
}
