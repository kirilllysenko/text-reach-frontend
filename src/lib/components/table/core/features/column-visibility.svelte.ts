import type { DataTableFeature } from "../data-table.svelte";
import type { EventService } from "../events";
import type { ColumnFeature } from "./column.svelte";

export interface ColumnVisibilityFeatureApi {
  columnVisibility: ColumnVisibilityFeature;
}

interface ColumnVisibilityFeatureDependencies {
  column?: ColumnFeature<unknown>;
}

export class ColumnVisibilityFeature {
  constructor(
    private readonly columns: ColumnFeature<unknown>,
    private readonly events: EventService,
  ) {}

  isVisible(columnId: string): boolean {
    return this.columns.find(columnId)?.feature.visibility ?? false;
  }

  reset(): void {
    this.columns.definitions.forEach((column) => {
      column.feature.visibility = true;
      this.events.emit("columnVisibilityChange", { columnId: column.id, visible: true });
    });
  }

  set(columnId: string, visible: boolean): void {
    const column = this.columns.find(columnId);

    if (!column || column.hideable === false) {
      return;
    }

    column.feature.visibility = visible;
    this.events.emit("columnVisibilityChange", { columnId, visible });
  }

  toggle(columnId: string): void {
    this.set(columnId, !this.isVisible(columnId));
  }
}

export function columnVisibilityFeature(): DataTableFeature<ColumnVisibilityFeatureApi> {
  return {
    dependencies: ["column"],
    id: "columnVisibility",
    install(table) {
      const typedTable = table as unknown as ColumnVisibilityFeatureDependencies;

      if (!typedTable.column) {
        throw new Error("columnVisibilityFeature requires columnFeature.");
      }

      return {
        columnVisibility: new ColumnVisibilityFeature(typedTable.column, table.events),
      };
    },
  };
}
