import { getCellValue, normalizeColumns } from "../columns";
import type { EventService } from "../events";
import type { DataTableColumnDef } from "../columns";
import type { DataTableFeature } from "../data-table.svelte";

export interface ColumnsFeatureOptions<TData, TMeta = unknown> {
  columns: DataTableColumnDef<TData, TMeta>[];
}

export interface ColumnsFeatureApi<TData, TMeta = unknown> {
  columns: ColumnsFeature<TData, TMeta>;
}

export class ColumnsFeature<TData, TMeta = unknown> {
  definitions: DataTableColumnDef<TData, TMeta>[];
  order = $state<string[]>([]);
  visibility = $state<Record<string, boolean>>({});

  visible = $derived.by(() =>
    this.order
      .map((columnId) => this.definitions.find((column) => column.id === columnId))
      .filter((column): column is DataTableColumnDef<TData, TMeta> => Boolean(column))
      .filter((column) => this.visibility[column.id] !== false),
  );

  constructor(
    columns: DataTableColumnDef<TData, TMeta>[],
    private readonly events: EventService,
  ) {
    this.definitions = normalizeColumns(columns);
    this.order = this.definitions.map((column) => column.id);
    this.visibility = Object.fromEntries(this.definitions.map((column) => [column.id, true]));
  }

  getCellValue(row: TData, column: DataTableColumnDef<TData, TMeta>): unknown {
    return getCellValue(row, column);
  }

  getLeafColumns(): DataTableColumnDef<TData, TMeta>[] {
    return this.definitions;
  }

  getVisibleColumns(): DataTableColumnDef<TData, TMeta>[] {
    return this.visible;
  }

  move(columnId: string, direction: "left" | "right"): void {
    const column = this.definitions.find((definition) => definition.id === columnId);

    if (column?.moveable === false) {
      return;
    }

    const index = this.order.indexOf(columnId);
    const targetIndex = direction === "left" ? index - 1 : index + 1;

    if (index === -1 || targetIndex < 0 || targetIndex >= this.order.length) {
      return;
    }

    const nextOrder = [...this.order];
    const [movedColumn] = nextOrder.splice(index, 1);
    nextOrder.splice(targetIndex, 0, movedColumn);
    this.setOrder(nextOrder);
  }

  resetLayout(): void {
    this.order = this.definitions.map((column) => column.id);
    this.visibility = Object.fromEntries(this.definitions.map((column) => [column.id, true]));
    this.events.emit("columnOrderChange", { order: this.order });
  }

  setOrder(columnIds: string[]): void {
    const knownColumnIds = new Set(this.definitions.map((column) => column.id));
    this.order = columnIds.filter((columnId) => knownColumnIds.has(columnId));
    this.events.emit("columnOrderChange", { order: this.order });
  }

  setVisibility(columnId: string, visible: boolean): void {
    const column = this.definitions.find((definition) => definition.id === columnId);

    if (!column || column.hideable === false) {
      return;
    }

    this.visibility = { ...this.visibility, [columnId]: visible };
    this.events.emit("columnVisibilityChange", { columnId, visible });
  }

  toggleVisibility(columnId: string): void {
    this.setVisibility(columnId, this.visibility[columnId] === false);
  }
}

export function columnsFeature<TData, TMeta = unknown>(
  options: ColumnsFeatureOptions<TData, TMeta>,
): DataTableFeature<ColumnsFeatureApi<TData, TMeta>> {
  return {
    install(table) {
      return {
        columns: new ColumnsFeature(options.columns, table.events),
      };
    },
  };
}
