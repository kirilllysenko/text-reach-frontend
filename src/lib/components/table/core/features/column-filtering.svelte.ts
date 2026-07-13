import type { DatagridCore } from "../index.svelte";
import type { Component } from "svelte";
import type { GetValueFn } from "../data-types";

export type DataTableTextOperator = "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "EQUAL" | "NOT_EQUAL";

export type DataTableComparisonOperator =
  | "EQUAL"
  | "NOT_EQUAL"
  | "GREATER_THAN"
  | "LESS_THAN"
  | "GREATER_OR_EQUAL"
  | "LESS_OR_EQUAL";

export type DataTableContainmentOperator = "IN" | "NOT_IN";

export interface DataTableBaseFilter<TFilterId extends string = string> {
  filterId: TFilterId;
}

export interface DataTableTextFilter<TFilterId extends string = string> extends DataTableBaseFilter<TFilterId> {
  type: "text";
  operator: DataTableTextOperator;
  value: string | null;
}

export interface DataTableComparisonFilter<TFilterId extends string = string> extends DataTableBaseFilter<TFilterId> {
  type: "comparison";
  operator: DataTableComparisonOperator;
  value?: string | number;
}

export interface DataTableContainmentFilter<TFilterId extends string = string> extends DataTableBaseFilter<TFilterId> {
  type: "containment";
  operator: DataTableContainmentOperator;
  value: string[];
}

export type DataTableFilter<TFilterId extends string = string> =
  | DataTableTextFilter<TFilterId>
  | DataTableComparisonFilter<TFilterId>
  | DataTableContainmentFilter<TFilterId>;

interface FilterComponentProps<TFilter extends DataTableFilter> {
  filter: TFilter | null;
  value: TFilter["value"] | null;
  getValue: () => TFilter["value"] | null;
  setValue: (nextValue: TFilter["value"] | null | undefined) => void;
  clear: () => void;
}

export type DataTableTextFilterComponentProps<TFilterId extends string = string> =
  FilterComponentProps<DataTableTextFilter<TFilterId>>;

export type DataTableComparisonFilterComponentProps<TFilterId extends string = string> =
  FilterComponentProps<DataTableComparisonFilter<TFilterId>>;

export type DataTableContainmentFilterComponentProps<TFilterId extends string = string> =
  FilterComponentProps<DataTableContainmentFilter<TFilterId>>;

export interface DataTableBaseFilterDefinition<
  TFilterId extends string = string,
  TOriginalRow = any,
> {
  filterId: TFilterId;
  formatValue?: (value: DataTableFilter["value"], filter: DataTableFilter) => string;
  fieldId?: string;
  getValueFn?: GetValueFn<TOriginalRow>;
  hidden?: boolean;
  label?: string;
}

export interface DataTableTextFilterDefinition<
  TFilterId extends string = string,
  TOriginalRow = any,
> extends DataTableBaseFilterDefinition<TFilterId, TOriginalRow> {
  component?: Component<DataTableTextFilterComponentProps>;
  type: "text";
  defaultOperator?: DataTableTextOperator;
  operators?: readonly DataTableTextOperator[];
}

export interface DataTableComparisonFilterDefinition<
  TFilterId extends string = string,
  TOriginalRow = any,
> extends DataTableBaseFilterDefinition<TFilterId, TOriginalRow> {
  component?: Component<DataTableComparisonFilterComponentProps>;
  type: "comparison";
  defaultOperator?: DataTableComparisonOperator;
  operators?: readonly DataTableComparisonOperator[];
}

export interface DataTableContainmentFilterDefinition<
  TFilterId extends string = string,
  TOriginalRow = any,
> extends DataTableBaseFilterDefinition<TFilterId, TOriginalRow> {
  component?: Component<DataTableContainmentFilterComponentProps>;
  type: "containment";
  defaultOperator?: DataTableContainmentOperator;
  operators?: readonly DataTableContainmentOperator[];
}

export type DataTableFilterDefinition<TFilterId extends string = string, TOriginalRow = any> =
  | DataTableTextFilterDefinition<TFilterId, TOriginalRow>
  | DataTableComparisonFilterDefinition<TFilterId, TOriginalRow>
  | DataTableContainmentFilterDefinition<TFilterId, TOriginalRow>;

export type DataTableFilterFromDefinition<TDefinition> =
  TDefinition extends DataTableTextFilterDefinition<infer TFilterId>
    ? DataTableTextFilter<TFilterId>
    : TDefinition extends DataTableComparisonFilterDefinition<infer TFilterId>
      ? DataTableComparisonFilter<TFilterId>
      : TDefinition extends DataTableContainmentFilterDefinition<infer TFilterId>
        ? DataTableContainmentFilter<TFilterId>
        : never;

export type DataTableFilterFromDefinitions<TDefinitions extends readonly DataTableFilterDefinition[]> =
  DataTableFilterFromDefinition<TDefinitions[number]>;

export function textFilter<const TFilterId extends string, TOriginalRow = any>(
  definition: Omit<DataTableTextFilterDefinition<TFilterId, TOriginalRow>, "type">,
): DataTableTextFilterDefinition<TFilterId, TOriginalRow> {
  return { ...definition, type: "text" };
}

export function comparisonFilter<const TFilterId extends string, TOriginalRow = any>(
  definition: Omit<DataTableComparisonFilterDefinition<TFilterId, TOriginalRow>, "type">,
): DataTableComparisonFilterDefinition<TFilterId, TOriginalRow> {
  return { ...definition, type: "comparison" };
}

export function containmentFilter<const TFilterId extends string, TOriginalRow = any>(
  definition: Omit<DataTableContainmentFilterDefinition<TFilterId, TOriginalRow>, "type">,
): DataTableContainmentFilterDefinition<TFilterId, TOriginalRow> {
  return { ...definition, type: "containment" };
}

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

  getFilterValueGetter(filter: DataTableFilter): GetValueFn<any> {
    const definition = this.filterDefinitions.find((current) => current.filterId === filter.filterId);
    if (definition?.getValueFn) return definition.getValueFn;

    const fieldId = definition?.fieldId ?? filter.filterId;
    const column = this.datagrid.columns.findColumnById(fieldId);
    if (column?.type === "accessor" || column?.type === "computed") return column.getValueFn;

    throw new Error(`Filter ${filter.filterId} has no local value getter`);
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
