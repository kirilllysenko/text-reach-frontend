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

export type DataTableFilterValue = DataTableFilter["value"];

interface FilterComponentProps<TFilter extends DataTableFilter> {
  value: TFilter["value"] | null;
  getValue: () => TFilter["value"] | null;
  setValue: (nextValue: TFilter["value"] | null | undefined) => void;
  clear: () => void;
}

export type DataTableTextFilterComponentProps<TFilterId extends string = string> = FilterComponentProps<
  DataTableTextFilter<TFilterId>
>;

export type DataTableComparisonFilterComponentProps<TFilterId extends string = string> = FilterComponentProps<
  DataTableComparisonFilter<TFilterId>
>;

export type DataTableContainmentFilterComponentProps<TFilterId extends string = string> = FilterComponentProps<
  DataTableContainmentFilter<TFilterId>
>;

export interface DataTableBaseFilterDefinition<
  TFilterId extends string = string,
  TOriginalRow = any,
  TFilter = DataTableFilter<TFilterId>,
> {
  createFilter?: (value: DataTableFilterValue, operator: DataTableFilter["operator"]) => TFilter | null;
  filterId: TFilterId;
  formatValue?: (value: DataTableFilterValue, filter: any) => string;
  fieldId?: string;
  getOperator?: (filter: any) => DataTableFilter["operator"];
  getValue?: (filter: any) => DataTableFilterValue;
  getValueFn?: GetValueFn<TOriginalRow>;
  hidden?: boolean;
  isFilter?: (filter: any) => boolean;
  label?: string;
}

export interface DataTableTextFilterDefinition<
  TFilterId extends string = string,
  TOriginalRow = any,
  TFilter = DataTableTextFilter<TFilterId>,
> extends DataTableBaseFilterDefinition<TFilterId, TOriginalRow, TFilter> {
  component?: Component<DataTableTextFilterComponentProps>;
  type: "text";
  defaultOperator?: DataTableTextOperator;
  operators?: readonly DataTableTextOperator[];
}

export interface DataTableComparisonFilterDefinition<
  TFilterId extends string = string,
  TOriginalRow = any,
  TFilter = DataTableComparisonFilter<TFilterId>,
> extends DataTableBaseFilterDefinition<TFilterId, TOriginalRow, TFilter> {
  component?: Component<DataTableComparisonFilterComponentProps>;
  type: "comparison";
  defaultOperator?: DataTableComparisonOperator;
  operators?: readonly DataTableComparisonOperator[];
}

export interface DataTableContainmentFilterDefinition<
  TFilterId extends string = string,
  TOriginalRow = any,
  TFilter = DataTableContainmentFilter<TFilterId>,
> extends DataTableBaseFilterDefinition<TFilterId, TOriginalRow, TFilter> {
  component?: Component<DataTableContainmentFilterComponentProps>;
  type: "containment";
  defaultOperator?: DataTableContainmentOperator;
  operators?: readonly DataTableContainmentOperator[];
}

export type DataTableFilterDefinition<
  TFilterId extends string = string,
  TOriginalRow = any,
  TFilter = DataTableFilter<TFilterId>,
> =
  | DataTableTextFilterDefinition<TFilterId, TOriginalRow, TFilter>
  | DataTableComparisonFilterDefinition<TFilterId, TOriginalRow, TFilter>
  | DataTableContainmentFilterDefinition<TFilterId, TOriginalRow, TFilter>;

export type DataTableFilterFromDefinition<TDefinition> =
  TDefinition extends DataTableFilterDefinition<any, any, infer TFilter> ? TFilter : never;

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

export type ColumnFilteringState<TFilter = DataTableFilter> = {
  filterDefinitions: readonly DataTableFilterDefinition<string, any, TFilter>[];
  filters: Map<string, TFilter> | TFilter[];
  isManual: boolean;
};

export type ColumnFilteringFeatureConfig<TFilter = DataTableFilter> = Partial<ColumnFilteringState<TFilter>>;

/**
 * Manages active table filters using the shared DataTableFilter shape.
 */
export class ColumnFilteringFeature<TOriginalRow = any, TFilter = DataTableFilter> {
  datagrid: DatagridCore<any, any, any>;

  filterDefinitions: readonly DataTableFilterDefinition<string, any, TFilter>[] = [];
  isManual: boolean = $state(false);

  private filtersById = $state.raw(new Map<string, TFilter>());

  constructor(datagrid: DatagridCore<any, any, any>, config: ColumnFilteringFeatureConfig<TFilter> = {}) {
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

  getFilterId(filter: TFilter): string {
    const definition = this.getDefinitionForFilter(filter);
    if (definition) {
      return definition.filterId;
    }

    const filterId = (filter as DataTableFilter).filterId;
    if (typeof filterId === "string") {
      return filterId;
    }

    throw new Error("Filter does not match a definition");
  }

  getFilterValue(filter: TFilter): DataTableFilterValue {
    const definition = this.getDefinitionForFilter(filter);
    if (definition?.getValue) {
      return definition.getValue(filter);
    }

    return (filter as DataTableFilter).value;
  }

  getFilterOperator(filter: TFilter): DataTableFilter["operator"] {
    const definition = this.getDefinitionForFilter(filter);
    if (definition?.getOperator) {
      return definition.getOperator(filter);
    }

    return (filter as DataTableFilter).operator;
  }

  getFilterType(filter: TFilter): DataTableFilter["type"] {
    const definition = this.getDefinitionForFilter(filter);
    if (definition) {
      return definition.type;
    }

    return (filter as DataTableFilter).type;
  }

  createFilter(filterId: string, value: DataTableFilterValue, operator?: DataTableFilter["operator"]): TFilter | null {
    const definition = this.getDefinition(filterId);
    const nextOperator = operator ?? getDefinitionOperator(definition);
    if (definition?.createFilter) {
      return definition.createFilter(value, nextOperator);
    }

    if (!definition) {
      throw new Error(`Filter ${filterId} not found`);
    }

    return { filterId, operator: nextOperator, type: definition.type, value } as TFilter;
  }

  setFilter(filterId: string, filter: TFilter): void {
    this.assertFilterDefinition(filterId, filter);

    const nextFilters = new Map(this.filtersById);
    nextFilters.set(filterId, filter);
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
        const filterId = this.getFilterId(filter);
        this.assertFilterDefinition(filterId, filter);
        nextFilters.set(filterId, filter);
      });
    } else {
      filters.forEach((filter, filterId) => {
        this.assertFilterDefinition(filterId, filter);
        nextFilters.set(filterId, filter);
      });
    }

    this.filtersById = nextFilters;
  }

  getFilterFieldId(filter: TFilter): string {
    const definition = this.getDefinitionForFilter(filter);
    return definition?.fieldId ?? definition?.filterId ?? this.getFilterId(filter);
  }

  getFilterValueGetter(filter: TFilter): GetValueFn<any> {
    const definition = this.getDefinitionForFilter(filter);
    if (definition?.getValueFn) return definition.getValueFn;

    const fieldId = definition?.fieldId ?? definition?.filterId ?? this.getFilterId(filter);
    const column = this.datagrid.columns.findColumnById(fieldId);
    if (column?.type === "accessor" || column?.type === "computed") return column.getValueFn;

    throw new Error(`Filter ${this.getFilterId(filter)} has no local value getter`);
  }

  evaluateFilter(cellValue: unknown, sourceFilter: TFilter): boolean {
    const filter = this.toDataTableFilter(sourceFilter);
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

  isFilterActive(filter: TFilter): boolean {
    const type = this.getFilterType(filter);
    const value = this.getFilterValue(filter);

    if (type === "text") {
      return typeof value === "string" && Boolean(value.trim());
    }

    if (type === "comparison") {
      return typeof value !== "undefined" && value !== "";
    }

    return Array.isArray(value) && value.length > 0;
  }

  private assertFilterDefinition(filterId: string, filter: TFilter): void {
    if (this.getFilterId(filter) !== filterId) {
      throw new Error(`Filter does not match target filter id ${filterId}`);
    }

    const definition = this.getDefinition(filterId);
    if (definition && definition.type !== this.getFilterType(filter)) {
      throw new Error(`Filter ${filterId} must be a ${definition.type} filter`);
    }
  }

  private getDefinition(filterId: string): DataTableFilterDefinition<string, any, TFilter> | undefined {
    return this.filterDefinitions.find((definition) => definition.filterId === filterId);
  }

  private getDefinitionForFilter(filter: TFilter): DataTableFilterDefinition<string, any, TFilter> | undefined {
    const adaptedDefinition = this.filterDefinitions.find((definition) => definition.isFilter?.(filter));
    if (adaptedDefinition) {
      return adaptedDefinition;
    }

    const filterId = (filter as DataTableFilter).filterId;
    return typeof filterId === "string" ? this.getDefinition(filterId) : undefined;
  }

  private toDataTableFilter(filter: TFilter): DataTableFilter {
    return {
      filterId: this.getFilterId(filter),
      operator: this.getFilterOperator(filter),
      type: this.getFilterType(filter),
      value: this.getFilterValue(filter),
    } as DataTableFilter;
  }
}

function getDefinitionOperator(
  definition: DataTableFilterDefinition<string, any, any> | undefined,
): DataTableFilter["operator"] {
  if (!definition) {
    return "EQUAL";
  }

  if (definition.type === "comparison") {
    return definition.defaultOperator ?? "EQUAL";
  }

  if (definition.type === "containment") {
    return definition.defaultOperator ?? "IN";
  }

  return definition.defaultOperator ?? "CONTAINS";
}
