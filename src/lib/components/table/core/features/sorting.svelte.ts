import type { EventService } from "../events";

export type DataTableSortDirection = "ascending" | "descending" | "intermediate";

export interface DataTableSort {
  columnId: string;
  direction: Exclude<DataTableSortDirection, "intermediate">;
}

export class SortingFeature {
  sorts = $state<DataTableSort[]>([]);

  constructor(private readonly events: EventService) {}

  clear(): void {
    this.set([]);
  }

  clearColumn(columnId: string): void {
    this.set(this.sorts.filter((sort) => sort.columnId !== columnId));
  }

  getDirection(columnId: string): DataTableSortDirection {
    return this.sorts.find((sort) => sort.columnId === columnId)?.direction ?? "intermediate";
  }

  getIndex(columnId: string): number | null {
    const index = this.sorts.findIndex((sort) => sort.columnId === columnId);
    return index === -1 ? null : index + 1;
  }

  set(sorts: DataTableSort[]): void {
    this.sorts = sorts;
    this.events.emit("sortChange", sorts);
  }

  toggle(columnId: string, multi = false): void {
    const currentDirection = this.getDirection(columnId);
    const remainingSorts = multi ? this.sorts.filter((sort) => sort.columnId !== columnId) : [];

    if (currentDirection === "intermediate") {
      this.set([...remainingSorts, { columnId, direction: "ascending" }]);
      return;
    }

    if (currentDirection === "ascending") {
      this.set([...remainingSorts, { columnId, direction: "descending" }]);
      return;
    }

    this.set(remainingSorts);
  }
}
