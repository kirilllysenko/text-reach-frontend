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
  filters = $state<DataTableFilter[]>([]);

  constructor(
    filters: DataTableFilter[] = [],
    private readonly events: EventService,
  ) {
    this.filters = filters;
  }

  clear(): void {
    this.setAll([]);
  }

  remove(filterId: string): void {
    this.setAll(this.filters.filter((filter) => filter.filterId !== filterId));
  }

  reset(): void {
    this.clear();
  }

  setAll(filters: DataTableFilter[]): void {
    this.filters = filters;
    this.events.emit("filterChange", filters);
  }

  set(filterId: string, filter: DataTableFilter): void {
    this.setAll([...this.filters.filter((current) => current.filterId !== filterId), { ...filter, filterId }]);
  }
}

export function filtersFeature(options: FiltersFeatureOptions = {}): DataTableFeature<FiltersFeatureApi> {
  return {
    dependencies: [],
    id: "filters",
    install(table) {
      return {
        filters: new FiltersFeature(options.filters, table.events),
      };
    },
  };
}
