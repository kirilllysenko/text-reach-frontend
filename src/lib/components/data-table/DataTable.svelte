<script lang="ts" generics="TRow extends RowData">
  import { onDestroy, untrack } from "svelte";
  import {
    createTable,
    functionalUpdate,
    getCoreRowModel,
    type ColumnOrderState,
    type RowData,
    type TableOptions,
    type TableOptionsResolved,
    type Updater,
  } from "@tanstack/table-core";
  import { createVirtualizer } from "@tanstack/svelte-virtual";
  import { derived, get, writable, type Writable } from "svelte/store";
  import DataTableHeaderCell from "./DataTableHeaderCell.svelte";
  import DataTableSkeletonRows from "./DataTableSkeletonRows.svelte";
  import type {
    DataTableColumn,
    DataTableFetchRequest,
    DataTableFetchRows,
    DataTableRenderedColumn,
  } from "./data-table-types";
  import {
    DATA_TABLE_DEFAULT_PAGE_SIZE,
    DATA_TABLE_OVERSCAN,
    DATA_TABLE_ROW_HEIGHT,
    DATA_TABLE_SKELETON_ROW_COUNT,
    appendRows,
    formatCellValue,
    getMaxLoadedIndex,
    getMinLoadedIndex,
    getPageIndexForScroll,
    moveColumn,
    pageHasLoadedRows,
    prependRows,
    reconcileColumnOrder,
    replaceRowsForPage,
    sameStringArray,
    toTanstackColumns,
  } from "./data-table-utils";

  interface Props {
    columns: DataTableColumn<TRow>[];
    fetchRows: DataTableFetchRows<TRow>;
    totalRows: number;
    getRowId: (row: TRow) => string;
    pageSize?: number;
    resizable?: boolean;
    reorderable?: boolean;
    virtual?: boolean;
    emptyLabel?: string;
    errorLabel?: string;
    onRowClick?: (row: TRow) => void;
  }

  type LoadingReason = DataTableFetchRequest["reason"] | null;
  type ScrollIntent = "gesture" | "scrollbar" | null;

  let {
    columns,
    fetchRows,
    totalRows,
    getRowId,
    pageSize = DATA_TABLE_DEFAULT_PAGE_SIZE,
    resizable = false,
    reorderable = false,
    virtual = true,
    emptyLabel = "No rows found",
    errorLabel = "Could not load rows.",
    onRowClick,
  }: Props = $props();

  let scrollElement = $state<HTMLDivElement | null>(null);
  let loadedRows = $state<Map<number, TRow>>(new Map());
  let pageIndex = $state(0);
  let nextCursor = $state<unknown[] | null>(null);
  let prevCursor = $state<unknown[] | null>(null);
  let loadingReason = $state<LoadingReason>(null);
  let errorMessage = $state<string | null>(null);
  let columnOrder = $state<string[]>([]);
  let draggingColumnId = $state<string | null>(null);
  let scrollIntent = $state<ScrollIntent>(null);
  let requestVersion = 0;
  let scrollbarLoadTimer: ReturnType<typeof setTimeout> | null = null;
  let initialized = false;

  const tableOptions = writable<TableOptions<TRow>>({
    data: [],
    columns: [],
    getCoreRowModel: getCoreRowModel(),
  });
  const table = createTableStore(tableOptions);

  const tanstackColumns = $derived(toTanstackColumns(columns, resizable));
  const rowsForTable = $derived(Array.from(loadedRows.values()));
  const denseRows = $derived.by(() =>
    Array.from(loadedRows.entries())
      .sort(([leftIndex], [rightIndex]) => leftIndex - rightIndex)
      .map(([, row]) => row),
  );
  const totalVirtualRows = $derived.by(() => {
    if (loadingReason && totalRows === 0) {
      return Math.min(pageSize, DATA_TABLE_SKELETON_ROW_COUNT);
    }

    return Math.max(totalRows, getMaxLoadedIndex(loadedRows) + 1);
  });
  const renderedRowCount = $derived.by(() => {
    if (virtual) {
      return totalVirtualRows;
    }

    if (loadingReason && loadedRows.size === 0) {
      return Math.min(pageSize, DATA_TABLE_SKELETON_ROW_COUNT);
    }

    return loadedRows.size;
  });
  const tableWidth = $derived(Math.max($table.getTotalSize(), 1));
  const renderedColumns = $derived.by<DataTableRenderedColumn<TRow>[]>(() =>
    $table.getVisibleLeafColumns().map((column) => ({
      id: column.id,
      header: String(column.columnDef.header ?? column.id),
      size: column.getSize(),
      definition: columns.find((definition) => definition.id === column.id),
    })),
  );
  const gridTemplate = $derived(renderedColumns.map((column) => `${column.size}px`).join(" "));
  const canClickRows = $derived(Boolean(onRowClick));

  const virtualizer = createVirtualizer<HTMLDivElement, HTMLDivElement>({
    count: 0,
    getScrollElement: () => scrollElement,
    estimateSize: () => DATA_TABLE_ROW_HEIGHT,
    overscan: DATA_TABLE_OVERSCAN,
  });

  $effect(() => {
    const nextColumnOrder = reconcileColumnOrder(columnOrder, columns);

    if (!sameStringArray(columnOrder, nextColumnOrder)) {
      columnOrder = nextColumnOrder;
    }

    tableOptions.set({
      data: rowsForTable,
      columns: tanstackColumns,
      getCoreRowModel: getCoreRowModel(),
      columnResizeMode: "onChange",
      enableColumnResizing: resizable,
      state: {
        columnOrder,
      },
      onColumnOrderChange: updateColumnOrder,
    });
  });

  $effect(() => {
    get(virtualizer).setOptions({
      count: renderedRowCount,
      getScrollElement: () => scrollElement,
      estimateSize: () => DATA_TABLE_ROW_HEIGHT,
      overscan: DATA_TABLE_OVERSCAN,
    });
  });

  $effect(() => {
    const activeFetchRows = fetchRows;
    const activePageSize = pageSize;

    untrack(() => {
      const reason = initialized ? "refresh" : "initial";
      initialized = true;
      void loadPage(0, reason, activeFetchRows, activePageSize);
    });
  });

  onDestroy(() => {
    if (scrollbarLoadTimer) {
      clearTimeout(scrollbarLoadTimer);
    }

    document.body.classList.remove("dragging");
    document.body.classList.remove("resizing");
  });

  function updateColumnOrder(updater: Updater<ColumnOrderState>): void {
    columnOrder = functionalUpdate(updater, columnOrder);
  }

  function setLoading(reason: LoadingReason): void {
    loadingReason = reason;
    errorMessage = null;
  }

  async function loadPage(
    targetPageIndex: number,
    reason: "initial" | "refresh" | "scrollbar-page",
    activeFetchRows = fetchRows,
    activePageSize = pageSize,
  ): Promise<void> {
    if (loadingReason && reason === "scrollbar-page") {
      return;
    }

    const version = (requestVersion += 1);
    pageIndex = targetPageIndex;
    setLoading(reason);

    if (reason !== "scrollbar-page") {
      scrollElement?.scrollTo({ top: targetPageIndex * activePageSize * DATA_TABLE_ROW_HEIGHT });
    }

    loadedRows = new Map();

    try {
      const response = await activeFetchRows({
        kind: "page",
        reason,
        pageIndex: targetPageIndex,
        pageSize: activePageSize,
      });

      if (version !== requestVersion) {
        return;
      }

      loadedRows = replaceRowsForPage(response.rows, targetPageIndex, activePageSize);
      nextCursor = response.nextCursor ?? null;
      prevCursor = response.prevCursor ?? null;
      loadingReason = null;
    } catch (error) {
      if (version !== requestVersion) {
        return;
      }

      errorMessage = error instanceof Error ? error.message : errorLabel;
      loadingReason = null;
    }
  }

  async function loadByCursor(direction: "next" | "previous"): Promise<void> {
    if (loadingReason) {
      return;
    }

    const cursor = direction === "next" ? nextCursor : prevCursor;
    if (!cursor) {
      return;
    }

    if (direction === "next" && getMaxLoadedIndex(loadedRows) >= totalRows - 1) {
      return;
    }

    if (direction === "previous" && getMinLoadedIndex(loadedRows) <= 0) {
      return;
    }

    const version = (requestVersion += 1);
    const reason = direction === "next" ? "gesture-next" : "gesture-previous";
    setLoading(reason);

    try {
      const response = await fetchRows({
        kind: "cursor",
        reason,
        cursor,
        direction,
        pageSize,
      });

      if (version !== requestVersion) {
        return;
      }

      loadedRows =
        direction === "next" ? appendRows(loadedRows, response.rows) : prependRows(loadedRows, response.rows);
      nextCursor = response.nextCursor ?? nextCursor;
      prevCursor = response.prevCursor ?? prevCursor;
      pageIndex = scrollElement ? getPageIndexForScroll(scrollElement.scrollTop, pageSize, totalRows) : pageIndex;
      loadingReason = null;
    } catch (error) {
      if (version !== requestVersion) {
        return;
      }

      errorMessage = error instanceof Error ? error.message : errorLabel;
      loadingReason = null;
    }
  }

  function scheduleScrollbarPageLoad(): void {
    if (!scrollElement || totalRows <= 0) {
      return;
    }

    if (scrollbarLoadTimer) {
      clearTimeout(scrollbarLoadTimer);
    }

    scrollbarLoadTimer = setTimeout(() => {
      if (!scrollElement) {
        return;
      }

      const targetPageIndex = getPageIndexForScroll(scrollElement.scrollTop, pageSize, totalRows);
      if (targetPageIndex === pageIndex && pageHasLoadedRows(loadedRows, targetPageIndex, pageSize)) {
        return;
      }

      void loadPage(targetPageIndex, "scrollbar-page");
    }, 120);
  }

  function loadMoreFromGestureIfNeeded(): void {
    if (loadingReason || loadedRows.size === 0 || totalRows <= loadedRows.size) {
      return;
    }

    const virtualItems = $virtualizer.getVirtualItems();
    const firstVisibleItem = virtualItems.at(0);
    const lastVisibleItem = virtualItems.at(-1);

    if (!firstVisibleItem || !lastVisibleItem) {
      return;
    }

    const threshold = Math.min(Math.max(Math.floor(pageSize / 4), 6), 16);
    const maxLoadedIndex = getMaxLoadedIndex(loadedRows);
    const minLoadedIndex = getMinLoadedIndex(loadedRows);

    if (lastVisibleItem.index >= maxLoadedIndex - threshold) {
      void loadByCursor("next");
      return;
    }

    if (firstVisibleItem.index <= minLoadedIndex + threshold) {
      void loadByCursor("previous");
    }
  }

  function handleScroll(): void {
    if (scrollIntent === "scrollbar") {
      scheduleScrollbarPageLoad();
      return;
    }

    loadMoreFromGestureIfNeeded();
  }

  function handleWheel(): void {
    scrollIntent = "gesture";
  }

  function handleTouchStart(): void {
    scrollIntent = "gesture";
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (["ArrowDown", "ArrowUp", "End", "Home", "PageDown", "PageUp", "Space"].includes(event.key)) {
      scrollIntent = "gesture";
    }
  }

  function handlePointerDown(event: PointerEvent): void {
    if (!scrollElement) {
      return;
    }

    if ((event.target as Element | null)?.closest("[data-data-table-interactive='true']")) {
      return;
    }

    const rect = scrollElement.getBoundingClientRect();
    const scrollbarWidth = Math.max(scrollElement.offsetWidth - scrollElement.clientWidth, 12);
    scrollIntent = event.clientX >= rect.right - scrollbarWidth ? "scrollbar" : "gesture";
  }

  function handleReorderStart(columnId: string): void {
    draggingColumnId = columnId;
  }

  function handleReorderDrop(targetColumnId: string): void {
    if (!draggingColumnId) {
      return;
    }

    columnOrder = moveColumn(columnOrder, draggingColumnId, targetColumnId);
    draggingColumnId = null;
  }

  function clearDraggingColumn(): void {
    draggingColumnId = null;
  }

  function retryLoad(): void {
    void loadPage(pageIndex, loadedRows.size > 0 ? "refresh" : "initial");
  }

  function getCellValue(row: TRow, column: DataTableRenderedColumn<TRow>): unknown {
    return column.definition?.accessor(row);
  }

  function createTableStore(optionsStore: Writable<TableOptions<TRow>>) {
    let resolvedOptions: TableOptionsResolved<TRow> = {
      state: {},
      onStateChange: () => {},
      renderFallbackValue: null,
      ...get(optionsStore),
    };

    const tableInstance = createTable<TRow>(resolvedOptions);
    const stateStore = writable(tableInstance.initialState);

    return derived([stateStore, optionsStore], ([$state, $options]) => {
      resolvedOptions = {
        ...resolvedOptions,
        ...$options,
        onStateChange: $options.onStateChange ?? resolvedOptions.onStateChange,
      };

      tableInstance.setOptions((previous) => ({
        ...previous,
        ...$options,
        state: {
          ...$state,
          ...$options.state,
        },
        onStateChange: (updater) => {
          if (updater instanceof Function) {
            stateStore.update(updater);
          } else {
            stateStore.set(updater);
          }

          resolvedOptions.onStateChange?.(updater);
        },
      }));

      return tableInstance;
    });
  }
</script>

<div class="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
  <div class="shrink-0 overflow-hidden border-b border-slate-200 bg-slate-50">
    <div class="flex" style={`width:${tableWidth}px;`}>
      {#each $table.getHeaderGroups() as headerGroup (headerGroup.id)}
        {#each headerGroup.headers as header (header.id)}
          <DataTableHeaderCell
            {header}
            label={String(header.column.columnDef.header ?? header.column.id)}
            {resizable}
            reorderable={reorderable &&
              columns.find((column) => column.id === header.column.id)?.enableOrdering !== false}
            {draggingColumnId}
            onReorderStart={handleReorderStart}
            onReorderDrop={handleReorderDrop}
            onReorderEnd={clearDraggingColumn}
          />
        {/each}
      {/each}
    </div>
  </div>

  <div
    bind:this={scrollElement}
    class="min-h-0 grow overflow-auto"
    tabindex="0"
    role="grid"
    aria-label="Data table"
    onscroll={handleScroll}
    onwheel={handleWheel}
    ontouchstart={handleTouchStart}
    onkeydown={handleKeydown}
    onpointerdown={handlePointerDown}
  >
    {#if errorMessage}
      <div class="flex min-h-40 items-center justify-center px-4 text-sm text-slate-600">
        <div class="text-center">
          <p>{errorMessage}</p>
          <button
            class="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700
              shadow-sm hover:cursor-pointer hover:bg-slate-50"
            type="button"
            onclick={retryLoad}
          >
            Retry
          </button>
        </div>
      </div>
    {:else if totalVirtualRows === 0 && !loadingReason}
      <div class="flex min-h-40 items-center justify-center px-4 text-sm text-slate-500">{emptyLabel}</div>
    {:else}
      <div class="relative" style={`width:${tableWidth}px;height:${$virtualizer.getTotalSize()}px;`}>
        {#each $virtualizer.getVirtualItems() as item (item.key)}
          {@const row = virtual ? loadedRows.get(item.index) : denseRows[item.index]}
          {@const rowIndex = virtual ? item.index : pageIndex * pageSize + item.index}

          {#if row}
            <button
              class={[
                `absolute top-0 left-0 grid border-b border-slate-100 bg-white text-left text-sm text-slate-700
                  hover:bg-slate-50`,
                canClickRows ? "cursor-pointer" : "cursor-default",
              ]}
              style={`width:${tableWidth}px;height:${item.size}px;transform:translateY(${item.start}px);grid-template-columns:${gridTemplate};`}
              type="button"
              role="row"
              aria-rowindex={rowIndex + 1}
              data-row-id={getRowId(row)}
              onclick={() => onRowClick?.(row)}
            >
              {#each renderedColumns as column (column.id)}
                {@const value = getCellValue(row, column)}

                <span class="flex min-w-0 items-center border-r border-slate-100 px-3" role="gridcell">
                  {#if column.definition?.cell}
                    {@const Cell = column.definition.cell}
                    <Cell {row} {value} />
                  {:else}
                    <span class="truncate">{formatCellValue(value)}</span>
                  {/if}
                </span>
              {/each}
            </button>
          {:else}
            <DataTableSkeletonRows
              columns={renderedColumns}
              {gridTemplate}
              top={item.start}
              height={item.size}
              {tableWidth}
              {rowIndex}
            />
          {/if}
        {/each}
      </div>
    {/if}
  </div>
</div>
