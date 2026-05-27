<script lang="ts" generics="TRow extends RowData">
  import type { Header, RowData } from "@tanstack/svelte-table";

  interface Props {
    header: Header<TRow, unknown>;
    label: string;
    resizable?: boolean;
    reorderable?: boolean;
    draggingColumnId?: string | null;
    onReorderStart?: (columnId: string) => void;
    onReorderOver?: (columnId: string) => void;
    onReorderDrop?: (columnId: string) => void;
    onReorderEnd?: () => void;
  }

  let {
    header,
    label,
    resizable = false,
    reorderable = false,
    draggingColumnId = null,
    onReorderStart,
    onReorderOver,
    onReorderDrop,
    onReorderEnd,
  }: Props = $props();

  const canResize = $derived(resizable && header.column.getCanResize());
  const canReorder = $derived(reorderable);

  function clearResizeClass(): void {
    document.body.classList.remove("resizing");
  }

  function handleResizeStart(event: MouseEvent | TouchEvent): void {
    if (!canResize) {
      return;
    }

    event.stopPropagation();
    document.body.classList.add("resizing");
    header.getResizeHandler()(event);

    window.addEventListener("mouseup", clearResizeClass, { once: true });
    window.addEventListener("touchend", clearResizeClass, { once: true });
    window.addEventListener("touchcancel", clearResizeClass, { once: true });
  }

  function clearDragClass(): void {
    document.body.classList.remove("dragging");
  }

  function handleDragStart(event: DragEvent): void {
    if (!canReorder) {
      event.preventDefault();
      return;
    }

    document.body.classList.add("dragging");
    event.dataTransfer?.setData("text/plain", header.column.id);
    event.dataTransfer?.setDragImage(event.currentTarget as Element, 16, 16);
    onReorderStart?.(header.column.id);
  }

  function handleDragOver(event: DragEvent): void {
    if (!canReorder || !draggingColumnId || draggingColumnId === header.column.id) {
      return;
    }

    event.preventDefault();
    onReorderOver?.(header.column.id);
  }

  function handleDrop(event: DragEvent): void {
    if (!canReorder || !draggingColumnId || draggingColumnId === header.column.id) {
      return;
    }

    event.preventDefault();
    onReorderDrop?.(header.column.id);
  }

  function handleDragEnd(): void {
    clearDragClass();
    onReorderEnd?.();
  }
</script>

<div
  class={[
    `group relative flex h-11 items-center border-r border-slate-200/80 bg-slate-50/95 px-3 text-left text-xs
      font-semibold text-slate-500 uppercase select-none`,
    canReorder && "cursor-grab",
    draggingColumnId === header.column.id && "bg-sky-50 text-sky-700",
  ]}
  style={`width:${header.getSize()}px;`}
  role="columnheader"
  tabindex="0"
  draggable={canReorder}
  data-data-table-interactive="true"
  ondragstart={handleDragStart}
  ondragover={handleDragOver}
  ondrop={handleDrop}
  ondragend={handleDragEnd}
>
  <span class="min-w-0 truncate">{label}</span>

  {#if canResize}
    <button
      class="absolute top-0 right-0 h-full w-2 translate-x-1/2 cursor-col-resize touch-none rounded-sm
        focus-visible:outline-2 focus-visible:outline-sky-500"
      type="button"
      aria-label={`Resize ${label} column`}
      data-data-table-interactive="true"
      onmousedown={handleResizeStart}
      ontouchstart={handleResizeStart}
    >
      <span class="mx-auto block h-full w-px bg-slate-300 opacity-0 group-hover:opacity-100"></span>
    </button>
  {/if}
</div>
