<script lang="ts" generics="TData, TMeta">
  import type { RenderedTable } from "./core/rendered-table";
  import TableVirtualBody from "./TableVirtualBody.svelte";
  import TableRow from "./TableRow.svelte";

  interface Props {
    view: RenderedTable<TData, TMeta>;
  }

  let { view }: Props = $props();
</script>

<div class="min-h-0 grow overflow-hidden">
  {#if view.loadingInitial}
    <div class="flex h-full min-h-40 items-center justify-center text-sm text-slate-500">Loading rows...</div>
  {:else if view.error && view.table.rows.isEmpty}
    <div class="flex h-full min-h-40 items-center justify-center text-sm text-rose-700">
      {#if view.options.loadingError}
        {@render view.options.loadingError()}
      {:else}
        {view.error}
      {/if}
    </div>
  {:else if view.table.rows.isEmpty}
    <div class="flex h-full min-h-40 items-center justify-center text-sm text-slate-500">
      {#if view.options.empty}
        {@render view.options.empty()}
      {:else}
        No rows found
      {/if}
    </div>
  {:else if view.capabilities.isVirtual}
    <TableVirtualBody {view} />
  {:else}
    <div class="h-full overflow-auto">
      <div class="min-w-max">
        {#each view.rows as row, rowIndex (view.table.options.getRowId?.(row, rowIndex) ?? rowIndex)}
          <TableRow {row} {rowIndex} {view} />
        {/each}
      </div>
    </div>
  {/if}
</div>
