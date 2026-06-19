import type { ColumnDef } from "@tanstack/table-core";
import type { DataTableColumn } from "./data-table-types";

export const DATA_TABLE_ROW_HEIGHT = 44;
export const DATA_TABLE_OVERSCAN = 8;
export const DATA_TABLE_DEFAULT_PAGE_SIZE = 50;
export const DATA_TABLE_SKELETON_ROW_COUNT = 12;
export const DATA_TABLE_DEFAULT_COLUMN_SIZE = 180;
export const DATA_TABLE_MIN_COLUMN_SIZE = 96;
export const DATA_TABLE_MAX_COLUMN_SIZE = 640;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function columnIds<TRow>(columns: DataTableColumn<TRow>[]): string[] {
  return columns.map((column) => column.id);
}

export function reconcileColumnOrder<TRow>(currentOrder: string[], columns: DataTableColumn<TRow>[]): string[] {
  const ids = columnIds(columns);
  const knownIds = new Set(ids);
  const nextOrder = currentOrder.filter((id) => knownIds.has(id));
  const existingIds = new Set(nextOrder);

  for (const id of ids) {
    if (!existingIds.has(id)) {
      nextOrder.push(id);
    }
  }

  return nextOrder;
}

export function sameStringArray(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

export function moveColumn(columnOrder: string[], sourceId: string, targetId: string): string[] {
  if (sourceId === targetId) {
    return columnOrder;
  }

  const nextOrder = columnOrder.filter((id) => id !== sourceId);
  const targetIndex = nextOrder.indexOf(targetId);

  if (targetIndex < 0) {
    return columnOrder;
  }

  nextOrder.splice(targetIndex, 0, sourceId);
  return nextOrder;
}

export function toTanstackColumns<TRow>(
  columns: DataTableColumn<TRow>[],
  resizable: boolean,
): ColumnDef<TRow, unknown>[] {
  return columns.map((column) => ({
    id: column.id,
    header: column.header,
    accessorFn: column.accessor,
    enableResizing: resizable && column.enableResizing !== false,
    size: column.size ?? DATA_TABLE_DEFAULT_COLUMN_SIZE,
    minSize: column.minSize ?? DATA_TABLE_MIN_COLUMN_SIZE,
    maxSize: column.maxSize ?? DATA_TABLE_MAX_COLUMN_SIZE,
  }));
}

export function formatCellValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (value instanceof Date) {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(value);
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}

export function replaceRowsForPage<TRow>(rows: TRow[], pageIndex: number, pageSize: number): Map<number, TRow> {
  const nextRows = new Map<number, TRow>();
  const startIndex = pageIndex * pageSize;

  rows.forEach((row, index) => {
    nextRows.set(startIndex + index, row);
  });

  return nextRows;
}

export function appendRows<TRow>(currentRows: Map<number, TRow>, rows: TRow[]): Map<number, TRow> {
  const nextRows = new Map(currentRows);
  const startIndex = getMaxLoadedIndex(currentRows) + 1;

  rows.forEach((row, index) => {
    nextRows.set(startIndex + index, row);
  });

  return nextRows;
}

export function prependRows<TRow>(currentRows: Map<number, TRow>, rows: TRow[]): Map<number, TRow> {
  const nextRows = new Map(currentRows);
  const startIndex = Math.max(0, getMinLoadedIndex(currentRows) - rows.length);

  rows.forEach((row, index) => {
    nextRows.set(startIndex + index, row);
  });

  return nextRows;
}

export function getMinLoadedIndex<TRow>(rows: Map<number, TRow>): number {
  if (rows.size === 0) {
    return 0;
  }

  return Math.min(...rows.keys());
}

export function getMaxLoadedIndex<TRow>(rows: Map<number, TRow>): number {
  if (rows.size === 0) {
    return -1;
  }

  return Math.max(...rows.keys());
}

export function getPageIndexForScroll(scrollTop: number, pageSize: number, totalRows: number): number {
  if (totalRows <= 0) {
    return 0;
  }

  const firstVisibleIndex = Math.floor(scrollTop / DATA_TABLE_ROW_HEIGHT);
  const maxPageIndex = Math.max(0, Math.ceil(totalRows / pageSize) - 1);

  return clamp(Math.floor(firstVisibleIndex / pageSize), 0, maxPageIndex);
}

export function pageHasLoadedRows<TRow>(rows: Map<number, TRow>, pageIndex: number, pageSize: number): boolean {
  const startIndex = pageIndex * pageSize;
  const endIndex = startIndex + pageSize;

  for (let index = startIndex; index < endIndex; index += 1) {
    if (rows.has(index)) {
      return true;
    }
  }

  return false;
}
