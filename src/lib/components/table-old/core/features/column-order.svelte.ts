import type { DataTableColumn } from "../columns";
import type { DataTableFeature } from "../data-table.svelte";
import type { EventService } from "../events";
import type { ColumnFeature } from "./column.svelte";

export interface ColumnOrderFeatureApi<TData, TMeta = unknown> {
  columnOrder: ColumnOrderFeature<TData, TMeta>;
}

interface ColumnOrderFeatureDependencies<TData, TMeta> {
  column?: ColumnFeature<TData, TMeta>;
}

export class ColumnOrderFeature<TData, TMeta = unknown> {
  private orderedColumns = $derived.by(() =>
    [...this.columns.definitions].sort((firstColumn, secondColumn) => {
      const orderDelta = firstColumn.feature.order - secondColumn.feature.order;
      return orderDelta === 0
        ? this.getDefinitionIndex(firstColumn.id) - this.getDefinitionIndex(secondColumn.id)
        : orderDelta;
    }),
  );

  order = $derived(this.orderedColumns.map((column) => column.id));

  visible = $derived.by(() => this.orderedColumns.filter((column) => column.feature.visibility));

  constructor(
    private readonly columns: ColumnFeature<TData, TMeta>,
    private readonly events: EventService,
  ) {}

  getVisibleColumns(): DataTableColumn<TData, TMeta>[] {
    return this.visible;
  }

  move(columnId: string, direction: "left" | "right"): void {
    const column = this.columns.find(columnId);

    if (column?.moveable === false) {
      return;
    }

    const orderedColumns = this.orderedColumns;
    const index = orderedColumns.findIndex((orderedColumn) => orderedColumn.id === columnId);
    const targetIndex = direction === "left" ? index - 1 : index + 1;

    if (index === -1 || targetIndex < 0 || targetIndex >= orderedColumns.length) {
      return;
    }

    const nextOrder = orderedColumns.map((orderedColumn) => orderedColumn.id);
    const [movedColumn] = nextOrder.splice(index, 1);
    nextOrder.splice(targetIndex, 0, movedColumn);
    this.setAll(nextOrder);
  }

  reset(): void {
    this.columns.definitions.forEach((column, index) => {
      column.feature.order = index;
    });
    this.events.emit("columnOrderChange", { order: this.order });
  }

  setAll(columnIds: string[]): void {
    const knownColumnIds = new Set(this.columns.definitions.map((column) => column.id));
    const nextOrder = columnIds.filter((columnId) => knownColumnIds.has(columnId));
    const orderedColumnIds = new Set(nextOrder);

    this.orderedColumns.forEach((column) => {
      if (!orderedColumnIds.has(column.id)) {
        nextOrder.push(column.id);
      }
    });

    nextOrder.forEach((columnId, index) => {
      const column = this.columns.find(columnId);

      if (column) {
        column.feature.order = index;
      }
    });

    this.events.emit("columnOrderChange", { order: this.order });
  }

  private getDefinitionIndex(columnId: string): number {
    return this.columns.definitions.findIndex((column) => column.id === columnId);
  }
}

export function columnOrderFeature<TData, TMeta = unknown>(): DataTableFeature<ColumnOrderFeatureApi<TData, TMeta>> {
  return {
    dependencies: ["column"],
    id: "columnOrder",
    install(table) {
      const typedTable = table as unknown as ColumnOrderFeatureDependencies<TData, TMeta>;

      if (!typedTable.column) {
        throw new Error("columnOrderFeature requires columnFeature.");
      }

      return {
        columnOrder: new ColumnOrderFeature(typedTable.column, table.events),
      };
    },
  };
}
