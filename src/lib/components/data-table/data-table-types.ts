import type { Component } from "svelte";

export interface DataTableColumn<TRow> {
  id: string;
  header: string;
  accessor: (row: TRow) => unknown;
  cell?: Component<{ row: TRow; value: unknown }>;
  size?: number;
  minSize?: number;
  maxSize?: number;
  enableResizing?: boolean;
  enableOrdering?: boolean;
}

export type DataTableFetchRequest =
  | {
      kind: "page";
      reason: "initial" | "refresh" | "scrollbar-page";
      pageIndex: number;
      pageSize: number;
    }
  | {
      kind: "cursor";
      reason: "gesture-next" | "gesture-previous";
      cursor: unknown[] | null;
      direction: "next" | "previous";
      pageSize: number;
    };

export interface DataTableFetchResult<TRow> {
  rows: TRow[];
  nextCursor?: unknown[] | null;
  prevCursor?: unknown[] | null;
}

export type DataTableFetchRows<TRow> = (request: DataTableFetchRequest) => Promise<DataTableFetchResult<TRow>>;

export interface DataTableRenderedColumn<TRow> {
  id: string;
  header: string;
  size: number;
  definition?: DataTableColumn<TRow>;
}
