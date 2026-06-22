<script lang="ts" generics="TData, TMeta">
  import type { DataTable } from "./core/data-table.svelte";
  import type { DataTableColumnDef } from "./core/columns";

  interface Props {
    column: DataTableColumnDef<TData, TMeta>;
    table: DataTable<TData, TMeta>;
  }

  let { column, table }: Props = $props();
</script>

<div class="flex items-center gap-1">
  {#if column.sortable}
    <button
      class="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700"
      type="button"
      aria-label={`Clear ${column.header} sort`}
      onclick={(event) => {
        event.stopPropagation();
        table.sorting.clearColumn(column.id);
      }}
    >
      ×
    </button>
  {/if}

  {#if column.moveable !== false}
    <button
      class="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700"
      type="button"
      aria-label={`Move ${column.header} left`}
      onclick={(event) => {
        event.stopPropagation();
        table.columns.move(column.id, "left");
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
        table.columns.move(column.id, "right");
      }}
    >
      ›
    </button>
  {/if}

  {#if column.hideable !== false}
    <button
      class="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700"
      type="button"
      aria-label={`Hide ${column.header}`}
      onclick={(event) => {
        event.stopPropagation();
        table.columns.toggleVisibility(column.id);
      }}
    >
      ◐
    </button>
  {/if}
</div>
