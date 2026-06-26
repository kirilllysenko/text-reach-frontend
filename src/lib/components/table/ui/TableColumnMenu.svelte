<script lang="ts" generics="TData">
  import type { DatagridCore } from "../core/index.svelte";
  import type { LeafColumn } from "../core/types";

  interface Props {
    column: LeafColumn<TData>;
    table: DatagridCore<TData>;
  }

  let { column, table }: Props = $props();
</script>

<div class="flex items-center gap-1">
  {#if column.isSortable()}
    <button
      class="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700"
      type="button"
      aria-label={`Clear ${column.header} sort`}
      onclick={(event) => {
        event.stopPropagation();
        table.handlers.sorting.clearColumnSort(column);
      }}
    >
      ×
    </button>
  {/if}

  {#if column.options.moveable !== false}
    <button
      class="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700"
      type="button"
      aria-label={`Move ${column.header} left`}
      onclick={(event) => {
        event.stopPropagation();
        table.handlers.column.moveLeft(column.columnId);
      }}
    >
      ‹
    </button>
    <button
      class="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700"
      type="button"
      aria-label={`Move ${column.header} right`}
      onclick={(event) => {
        event.stopPropagation();
        table.handlers.column.moveRight(column.columnId);
      }}
    >
      ›
    </button>
  {/if}

  {#if column.options.hideable !== false}
    <button
      class="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700"
      type="button"
      aria-label={`Hide ${column.header}`}
      onclick={(event) => {
        event.stopPropagation();
        table.handlers.column.toggleColumnVisibility(column.columnId);
      }}
    >
      ◐
    </button>
  {/if}
</div>
