<script lang="ts" generics="TData">
  import type { DatagridCore } from "../core/index.svelte";
  import type { LeafColumn } from "../core/types";
  import TableColumnMenu from "./TableColumnMenu.svelte";

  interface Props {
    table: DatagridCore<TData>;
  }

  let { table }: Props = $props();

  const visibleColumns = $derived(table.columns.getLeafColumnsInOrder().filter((column) => column.isVisible()));

  function toggleSort(event: MouseEvent, column: LeafColumn<TData>): void {
    if (!column.isSortable()) {
      return;
    }

    table.handlers.sorting.toggleColumnSort(column, event.ctrlKey || event.metaKey);
  }
</script>

<div class="shrink-0 overflow-x-auto border-b border-slate-200 bg-slate-50">
  <div class="flex min-w-max">
    {#each visibleColumns as column (column.columnId)}
      <div
        class={[
          `flex min-h-11 items-center gap-2 border-r border-slate-200 px-3 text-left text-xs font-semibold
          tracking-wide text-slate-600 uppercase`,
          "shrink-0",
        ]}
        style={`width:${column.state.size.width}px;min-width:${column.state.size.minWidth}px;max-width:${column.state.size.maxWidth}px`}
      >
        {#if column.isSortable()}
          <button
            class="min-w-0 flex-1 truncate text-left hover:cursor-pointer"
            type="button"
            onclick={(event) => toggleSort(event, column)}
          >
            {column.header}
          </button>
        {:else}
          <span class="min-w-0 flex-1 truncate">{column.header}</span>
        {/if}
        {#if table.features.sorting.getSortDirection(column.columnId) === "ascending"}
          <span aria-label="Sorted ascending">▲</span>
        {:else if table.features.sorting.getSortDirection(column.columnId) === "descending"}
          <span aria-label="Sorted descending">▼</span>
        {/if}
        {#if table.features.sorting.getSortConfigIndex(column.columnId)}
          <span class="text-[10px] text-slate-400">{table.features.sorting.getSortConfigIndex(column.columnId)}</span>
        {/if}
        <TableColumnMenu {table} {column} />
      </div>
    {/each}
  </div>
</div>
