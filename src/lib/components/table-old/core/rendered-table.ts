import type { DataTableColumn } from "./columns";
import type { DataTableCore } from "./data-table.svelte";
import type { ColumnFeatureApi } from "./features/column.svelte";
import type { ColumnOrderFeatureApi } from "./features/column-order.svelte";
import type { ColumnVisibilityFeatureApi } from "./features/column-visibility.svelte";
import type { FiltersFeatureApi } from "./features/filters.svelte";
import type { InfiniteLoaderFeatureApi } from "./features/infinite-loader.svelte";
import type { SortingFeatureApi, DataTableSortDirection } from "./features/sorting.svelte";
import type { VirtualWindowFeatureApi } from "./features/virtual-window.svelte";

export type DataTable<TData, TMeta = unknown> = DataTableCore<TData, TMeta> &
  ColumnFeatureApi<TData, TMeta> &
  ColumnVisibilityFeatureApi &
  ColumnOrderFeatureApi<TData, TMeta> &
  SortingFeatureApi &
  FiltersFeatureApi &
  InfiniteLoaderFeatureApi<TData> &
  VirtualWindowFeatureApi;

export type RenderableTable<TData, TMeta = unknown> = DataTableCore<TData, TMeta> &
  ColumnFeatureApi<TData, TMeta> &
  Partial<
    ColumnVisibilityFeatureApi &
      ColumnOrderFeatureApi<TData, TMeta> &
      SortingFeatureApi &
      FiltersFeatureApi &
      InfiniteLoaderFeatureApi<TData> &
      VirtualWindowFeatureApi
  >;

export interface RenderedTableActions {
  clearSort?: (columnId: string) => void;
  loadInitial: () => Promise<void>;
  loadMore?: () => Promise<void>;
  moveColumn?: (columnId: string, direction: "left" | "right") => void;
  reload?: () => Promise<void>;
  toggleColumnVisibility?: (columnId: string) => void;
  toggleSort?: (columnId: string, multi: boolean) => void;
  updateVirtualRange?: (range: { end: number; start: number }) => void;
}

export interface RenderedTableCapabilities {
  canHideColumns: boolean;
  canLoadMore: boolean;
  canReorderColumns: boolean;
  canSort: boolean;
  isVirtual: boolean;
}

export class RenderedTable<TData, TMeta = unknown> {
  readonly actions: RenderedTableActions;

  constructor(readonly table: RenderableTable<TData, TMeta>) {
    this.actions = {
      clearSort: table.sorting ? (columnId) => table.sorting?.remove(columnId) : undefined,
      loadInitial: table.loadInitial ?? (() => Promise.resolve()),
      loadMore: table.loadMore,
      moveColumn: table.columnOrder ? (columnId, direction) => table.columnOrder?.move(columnId, direction) : undefined,
      reload: table.reload,
      toggleColumnVisibility: table.columnVisibility
        ? (columnId) => table.columnVisibility?.toggle(columnId)
        : undefined,
      toggleSort: table.sorting ? (columnId, multi) => table.sorting?.toggle(columnId, multi) : undefined,
      updateVirtualRange: table.virtual ? (range) => table.virtual?.updateRange(range) : undefined,
    };
  }

  get capabilities(): RenderedTableCapabilities {
    return {
      canHideColumns: Boolean(this.table.columnVisibility),
      canLoadMore: Boolean(this.table.loader),
      canReorderColumns: Boolean(this.table.columnOrder),
      canSort: Boolean(this.table.sorting),
      isVirtual: Boolean(this.table.virtual),
    };
  }

  get error(): string | null {
    return this.table.loader?.error ?? null;
  }

  get loadingInitial(): boolean {
    return this.table.loader?.loadingInitial ?? false;
  }

  get loadingMore(): boolean {
    return this.table.loader?.loadingMore ?? false;
  }

  get options(): DataTableCore<TData, TMeta>["options"] {
    return this.table.options;
  }

  get rows(): TData[] {
    return this.table.visibleRows;
  }

  get statusLabel(): string {
    return this.table.statusLabel;
  }

  get virtualHeight(): string {
    return this.table.virtual?.height ?? "100%";
  }

  get visibleColumns(): DataTableColumn<TData, TMeta>[] {
    if (this.table.columnOrder) {
      return this.table.columnOrder.visible;
    }

    return this.table.column.definitions.filter((column) => column.feature.visibility);
  }

  getCellValue(row: TData, column: DataTableColumn<TData, TMeta>): unknown {
    return this.table.column.getCellValue(row, column);
  }

  getSortDirection(columnId: string): DataTableSortDirection {
    return this.table.sorting?.getDirection(columnId) ?? "intermediate";
  }

  getSortIndex(columnId: string): number | null {
    return this.table.sorting?.getIndex(columnId) ?? null;
  }
}

export function createRenderedTable<TData, TMeta = unknown>(
  table: RenderableTable<TData, TMeta>,
): RenderedTable<TData, TMeta> {
  return new RenderedTable(table);
}
