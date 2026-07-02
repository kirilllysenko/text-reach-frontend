<script lang="ts" generics="TData">
  import { onDestroy } from "svelte";
  import type { DatagridCore } from "../core/index.svelte";
  import type { LeafColumn } from "../core/types";

  interface Props {
    table: DatagridCore<TData>;
  }

  let { table }: Props = $props();
  let activeResizeColumn = $state<LeafColumn<TData> | null>(null);
  let activeResizePointerId = $state<number | null>(null);
  let resizeStartX = 0;
  let resizeStartWidth = 0;

  const visibleColumns = $derived(table.columns.getLeafColumnsInOrder().filter((column) => column.isVisible()));

  function toggleSort(event: MouseEvent, column: LeafColumn<TData>): void {
    if (!column.isSortable()) {
      return;
    }

    table.handlers.sorting.toggleColumnSort(column, event.ctrlKey || event.metaKey);
  }

  function resizeColumn(column: LeafColumn<TData>, width: number): void {
    table.handlers.column.updateColumnSize(column.columnId, Math.round(width));
  }

  function stopResize(): void {
    activeResizeColumn = null;
    activeResizePointerId = null;
    if (typeof document === "undefined") {
      return;
    }

    document.body.classList.remove("resizing");
  }

  function handleResizeMove(event: PointerEvent): void {
    if (!activeResizeColumn || event.pointerId !== activeResizePointerId) {
      return;
    }

    event.preventDefault();
    resizeColumn(activeResizeColumn, resizeStartWidth + event.clientX - resizeStartX);
  }

  function startResize(event: PointerEvent, column: LeafColumn<TData>): void {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    activeResizeColumn = column;
    activeResizePointerId = event.pointerId;
    resizeStartX = event.clientX;
    resizeStartWidth = column.state.size.width;
    const handle = event.currentTarget as HTMLElement;
    handle.setPointerCapture(event.pointerId);
    document.body.classList.add("resizing");
  }

  function finishResize(event: PointerEvent): void {
    if (event.pointerId !== activeResizePointerId) {
      return;
    }

    const handle = event.currentTarget as HTMLElement;
    if (handle.hasPointerCapture(event.pointerId)) {
      handle.releasePointerCapture(event.pointerId);
    }

    stopResize();
  }

  function handleResizeKeydown(event: KeyboardEvent, column: LeafColumn<TData>): void {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }

    event.preventDefault();
    resizeColumn(column, column.state.size.width + (event.key === "ArrowRight" ? 12 : -12));
  }

  onDestroy(stopResize);
</script>

<div class="shrink-0 overflow-x-auto border-b border-slate-200 bg-slate-50">
  <div class="flex w-max min-w-full">
    {#each visibleColumns as column (column.columnId)}
      <div
        class={[
          `relative flex min-h-11 items-center gap-2 border-r border-slate-200 px-3 pr-5 text-left text-xs font-semibold
          tracking-wide text-slate-600 uppercase`,
          "shrink-0",
          "last:border-r-0",
        ]}
        style={`width:${column.state.size.width}px;min-width:${column.state.size.minWidth}px;max-width:${column.state.size.maxWidth}px`}
      >
        {#if column.isSortable()}
          <button
            class="flex max-w-full min-w-0 items-center gap-1.5 text-left hover:cursor-pointer"
            type="button"
            onclick={(event) => toggleSort(event, column)}
          >
            <span class="min-w-0 truncate">{column.header}</span>
            {#if table.features.sorting.getSortDirection(column.columnId) === "ascending"}
              <span class="shrink-0" aria-label="Sorted ascending">▲</span>
            {:else if table.features.sorting.getSortDirection(column.columnId) === "descending"}
              <span class="shrink-0" aria-label="Sorted descending">▼</span>
            {/if}
            {#if table.features.sorting.getSortConfigIndex(column.columnId)}
              <span class="shrink-0 text-[10px] text-slate-400">
                {table.features.sorting.getSortConfigIndex(column.columnId)}
              </span>
            {/if}
          </button>
        {:else}
          <span class="max-w-full min-w-0 truncate">{column.header}</span>
        {/if}
        <!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
        <div
          class="absolute top-0 right-0 h-full w-2 cursor-col-resize touch-none rounded-none border-0 bg-transparent
            hover:bg-sky-200/70 focus-visible:bg-sky-200/70 focus-visible:outline-2 focus-visible:outline-sky-500"
          role="separator"
          tabindex="0"
          aria-orientation="vertical"
          aria-label={`Resize ${column.header} column`}
          aria-valuemin={column.state.size.minWidth}
          aria-valuemax={column.state.size.maxWidth}
          aria-valuenow={column.state.size.width}
          onpointerdown={(event) => startResize(event, column)}
          onpointermove={handleResizeMove}
          onpointerup={finishResize}
          onpointercancel={finishResize}
          onkeydown={(event) => handleResizeKeydown(event, column)}
        ></div>
      </div>
    {/each}
  </div>
</div>
