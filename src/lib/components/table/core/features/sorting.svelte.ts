import type { EventService } from "../events";
import type { DataTableFeature } from "../data-table.svelte";

export type DataTableSortDirection = "ascending" | "descending" | "intermediate";

export interface DataTableSort {
  direction: Exclude<DataTableSortDirection, "intermediate">;
  sortId: string;
}

export interface SortingFeatureApi {
  sorting: SortingFeature;
}

export interface SortingFeatureOptions {
  sorts?: DataTableSort[];
}

export class SortingFeature {
  sorts = $state<DataTableSort[]>([]);

  constructor(
    private readonly events: EventService,
    sorts: DataTableSort[] = [],
  ) {
    this.sorts = sorts;
  }

  add(sortId: string, direction: Exclude<DataTableSortDirection, "intermediate"> = "ascending"): void {
    this.set(sortId, direction);
  }

  clear(): void {
    this.replaceAll([]);
  }

  getDirection(sortId: string): DataTableSortDirection {
    return this.sorts.find((sort) => sort.sortId === sortId)?.direction ?? "intermediate";
  }

  getIndex(sortId: string): number | null {
    const index = this.sorts.findIndex((sort) => sort.sortId === sortId);
    return index === -1 ? null : index + 1;
  }

  replaceAll(sorts: DataTableSort[]): void {
    this.sorts = sorts;
    this.events.emit("sortChange", sorts);
  }

  remove(sortId: string): void {
    this.replaceAll(this.sorts.filter((sort) => sort.sortId !== sortId));
  }

  removeAt(index: number): void {
    this.replaceAll(this.sorts.filter((_, currentIndex) => currentIndex !== index));
  }

  set(sortId: string, direction: Exclude<DataTableSortDirection, "intermediate">): void {
    this.replaceAll([...this.sorts.filter((sort) => sort.sortId !== sortId), { direction, sortId }]);
  }

  toggle(sortId: string, multi = false): void {
    const currentDirection = this.getDirection(sortId);
    const remainingSorts = multi ? this.sorts.filter((sort) => sort.sortId !== sortId) : [];

    if (currentDirection === "intermediate") {
      this.replaceAll([...remainingSorts, { direction: "ascending", sortId }]);
      return;
    }

    if (currentDirection === "ascending") {
      this.replaceAll([...remainingSorts, { direction: "descending", sortId }]);
      return;
    }

    this.replaceAll(remainingSorts);
  }

  updateDirection(index: number, direction: Exclude<DataTableSortDirection, "intermediate">): void {
    this.replaceAll(this.sorts.map((sort, currentIndex) => (currentIndex === index ? { ...sort, direction } : sort)));
  }

  updateSortId(index: number, sortId: string): void {
    this.replaceAll(this.sorts.map((sort, currentIndex) => (currentIndex === index ? { ...sort, sortId } : sort)));
  }
}

export function sortingFeature(options: SortingFeatureOptions = {}): DataTableFeature<SortingFeatureApi> {
  return {
    install(table) {
      return {
        sorting: new SortingFeature(table.events, options.sorts),
      };
    },
  };
}
