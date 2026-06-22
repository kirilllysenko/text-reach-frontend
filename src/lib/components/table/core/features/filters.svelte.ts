import type { EventService } from "../events";

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
  columnId: string;
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
    this.set([]);
  }

  remove(columnId: string): void {
    this.set(this.value.filter((filter) => filter.columnId !== columnId));
  }

  reset(): void {
    this.set(structuredClone(this.initial));
  }

  set(filters: DataTableFilter[]): void {
    this.value = filters;
    this.events.emit("filterChange", filters);
  }

  upsert(filter: DataTableFilter): void {
    this.set([...this.value.filter((current) => current.columnId !== filter.columnId), filter]);
  }
}
