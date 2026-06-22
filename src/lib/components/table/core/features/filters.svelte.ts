import type { EventService } from "../events";
import type { DataTableFeature } from "../data-table.svelte";

export type DataTableTextOperator = "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "EQUAL" | "NOT_EQUAL";

export type DataTableComparisonOperator =
  | "EQUAL"
  | "NOT_EQUAL"
  | "GREATER_THAN"
  | "LESS_THAN"
  | "GREATER_OR_EQUAL"
  | "LESS_OR_EQUAL";

export type DataTableContainmentOperator = "IN" | "NOT_IN";

export interface DataTableBaseFilter {
  filterId: string;
}

export interface DataTableTextFilter extends DataTableBaseFilter {
  type: "text";
  operator: DataTableTextOperator;
  value: string | null;
}

export interface DataTableComparisonFilter extends DataTableBaseFilter {
  type: "comparison";
  operator: DataTableComparisonOperator;
  value?: string | number;
}

export interface DataTableContainmentFilter extends DataTableBaseFilter {
  type: "containment";
  operator: DataTableContainmentOperator;
  value: string[];
}

export type DataTableFilter = DataTableTextFilter | DataTableComparisonFilter | DataTableContainmentFilter;

export interface DataTableFilterConfig {
  kind: "text" | "number" | "select" | "date" | "boolean" | "custom";
  operator?: DataTableTextOperator | DataTableComparisonOperator | DataTableContainmentOperator;
}

export interface FiltersFeatureOptions {
  filters?: DataTableFilter[];
}

export interface FiltersFeatureApi {
  filters: FiltersFeature;
}

export class FiltersFeature {
  initial: DataTableFilter[];
  value = $state<DataTableFilter[]>([]);

  constructor(
    initial: DataTableFilter[] = [],
    private readonly events: EventService,
  ) {
    this.initial = structuredClone(initial);
    this.value = initial;
  }

  clear(): void {
    this.replaceAll([]);
  }

  remove(filterId: string): void {
    this.replaceAll(this.value.filter((filter) => filter.filterId !== filterId));
  }

  reset(): void {
    this.replaceAll(structuredClone(this.initial));
  }

  replaceAll(filters: DataTableFilter[]): void {
    this.value = filters;
    this.events.emit("filterChange", filters);
  }

  set(filterId: string, filter: DataTableFilter): void {
    this.replaceAll([...this.value.filter((current) => current.filterId !== filterId), { ...filter, filterId }]);
  }
}

export function filtersFeature(options: FiltersFeatureOptions = {}): DataTableFeature<FiltersFeatureApi> {
  return {
    install(table) {
      return {
        filters: new FiltersFeature(options.filters, table.events),
      };
    },
  };
}
