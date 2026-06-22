<script lang="ts" generics="TData, TMeta">
  import type { DataTable } from "./core/rendered-table";
  import TableColumnMenu from "./TableColumnMenu.svelte";

  interface Props {
    table: DataTable<TData, TMeta>;
  }

  let { table }: Props = $props();

  function toggleSort(event: MouseEvent, sortId: string, sortable?: boolean): void {
    if (!sortable) {
      return;
    }

    table.sorting.toggle(sortId, event.ctrlKey || event.metaKey);
  }
</script>

<div class="shrink-0 overflow-x-auto border-b border-slate-200 bg-slate-50">
  <div class="flex min-w-max">
    {#each table.columns.visible as column (column.id)}
      <div
        class={[
          `flex min-h-11 items-center gap-2 border-r border-slate-200 px-3 text-left text-xs font-semibold
          tracking-wide text-slate-600 uppercase`,
          column.grow ? "grow" : "shrink-0",
        ]}
        style={`width:${column.size}px;min-width:${column.minSize}px;max-width:${column.grow ? "none" : `${column.maxSize}px`}`}
      >
        {#if column.sortable}
          <button
            class="min-w-0 flex-1 truncate text-left hover:cursor-pointer"
            type="button"
            onclick={(event) => toggleSort(event, column.id, column.sortable)}
          >
            {column.header}
          </button>
        {:else}
          <span class="min-w-0 flex-1 truncate">{column.header}</span>
        {/if}
        {#if table.sorting.getDirection(column.id) === "ascending"}
          <span aria-label="Sorted ascending">▲</span>
        {:else if table.sorting.getDirection(column.id) === "descending"}
          <span aria-label="Sorted descending">▼</span>
        {/if}
        {#if table.sorting.getIndex(column.id)}
          <span class="text-[10px] text-slate-400">{table.sorting.getIndex(column.id)}</span>
        {/if}
        <TableColumnMenu {table} {column} />
      </div>
    {/each}
  </div>
</div>
