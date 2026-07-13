import type { LeafColumn } from "../core/column-types";

function getColumnSizeVariableName(column: LeafColumn<any>): string {
  const safeColumnId = column.columnId.replace(/[^a-zA-Z0-9_-]/g, "-");
  const hash = Array.from(column.columnId).reduce((result, character) => {
    return (result * 31 + character.charCodeAt(0)) >>> 0;
  }, 0);

  return `--data-table-column-${safeColumnId || "column"}-${hash.toString(36)}-width`;
}

export function getColumnSizeStyle(column: LeafColumn<any>): string {
  const { maxWidth, minWidth } = column.state.size;

  return `width:var(${getColumnSizeVariableName(column)});min-width:${minWidth}px;max-width:${maxWidth}px`;
}

export function getColumnSizeRootStyle(columns: LeafColumn<any>[]): string {
  return columns.map((column) => `${getColumnSizeVariableName(column)}:${column.state.size.width}px`).join(";");
}

export function setColumnSizeStyleProperty(root: HTMLElement, column: LeafColumn<any>, width: number): void {
  root.style.setProperty(getColumnSizeVariableName(column), `${width}px`);
}
