export type DataTableCursor = unknown[] | null;

export class RowsFeature<TData> {
  items = $state<TData[]>([]);
  nextCursor = $state<DataTableCursor>(null);
  totalRows = $state<number | null>(null);

  hasMore = $derived(this.nextCursor !== null);
  isEmpty = $derived(this.items.length === 0);
  loadedCount = $derived(this.items.length);

  append(rows: TData[], nextCursor: DataTableCursor, totalRows?: number): void {
    this.items = [...this.items, ...rows];
    this.nextCursor = nextCursor;
    this.totalRows = totalRows ?? this.totalRows;
  }

  reset(): void {
    this.items = [];
    this.nextCursor = null;
    this.totalRows = null;
  }

  set(rows: TData[], nextCursor: DataTableCursor, totalRows?: number): void {
    this.items = rows;
    this.nextCursor = nextCursor;
    this.totalRows = totalRows ?? null;
  }
}
