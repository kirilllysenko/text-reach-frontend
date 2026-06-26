<script lang="ts" generics="TData">
  import type { DatagridCore } from "../core/index.svelte";
  import TableVirtualBody from "./TableVirtualBody.svelte";
  import TableRow from "./TableRow.svelte";

  interface Props {
    table: DatagridCore<TData>;
    error?: string | null;
    loading?: boolean;
  }

  let { table, error = null, loading = false }: Props = $props();

  const rows = $derived(table.rows.getVisibleBasicRows());
</script>

<div class="min-h-0 grow overflow-hidden">
  {#if loading}
    <div class="flex h-full min-h-40 items-center justify-center text-sm text-slate-500">Loading rows...</div>
  {:else if error}
    <div class="flex h-full min-h-40 items-center justify-center text-sm text-rose-700">{error}</div>
  {:else if rows.length === 0}
    <div class="flex h-full min-h-40 items-center justify-center text-sm text-slate-500">No rows found</div>
  {:else}
    <div class="h-full overflow-auto">
      <div class="min-w-max">
        {#each rows as row, rowIndex (row.identifier)}
          <TableRow {row} {rowIndex} {table} />
        {/each}
      </div>
    </div>
  {/if}
</div>
