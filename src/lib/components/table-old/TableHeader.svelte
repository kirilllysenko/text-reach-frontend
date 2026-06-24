<script lang="ts" generics="TData, TMeta">
  import type { RenderedTable } from "./core/rendered-table";
  import TableColumnMenu from "./TableColumnMenu.svelte";

  interface Props {
    view: RenderedTable<TData, TMeta>;
  }

  let { view }: Props = $props();

  function toggleSort(event: MouseEvent, sortId: string, sortable?: boolean): void {
    if (!sortable || !view.actions.toggleSort) {
      return;
    }

    view.actions.toggleSort(sortId, event.ctrlKey || event.metaKey);
  }
</script>

<div class="shrink-0 overflow-x-auto border-b border-slate-200 bg-slate-50">
  <div class="flex min-w-max">
    {#each view.visibleColumns as column (column.id)}
      <div
        class={[
          `flex min-h-11 items-center gap-2 border-r border-slate-200 px-3 text-left text-xs font-semibold
          tracking-wide text-slate-600 uppercase`,
          column.grow ? "grow" : "shrink-0",
        ]}
        style={`width:${column.size}px;min-width:${column.minSize}px;max-width:${column.grow ? "none" : `${column.maxSize}px`}`}
      >
        {#if column.sortable && view.capabilities.canSort}
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
        {#if view.getSortDirection(column.id) === "ascending"}
          <span aria-label="Sorted ascending">▲</span>
        {:else if view.getSortDirection(column.id) === "descending"}
          <span aria-label="Sorted descending">▼</span>
        {/if}
        {#if view.getSortIndex(column.id)}
          <span class="text-[10px] text-slate-400">{view.getSortIndex(column.id)}</span>
        {/if}
        <TableColumnMenu {view} {column} />
      </div>
    {/each}
  </div>
</div>
