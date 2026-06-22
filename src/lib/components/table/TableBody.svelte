<script lang="ts" generics="TData, TMeta">
  import type { DataTable } from "./core/data-table.svelte";
  import TableVirtualBody from "./TableVirtualBody.svelte";

  interface Props {
    table: DataTable<TData, TMeta>;
  }

  let { table }: Props = $props();
</script>

<div class="min-h-0 grow overflow-hidden">
  {#if table.loader.loadingInitial}
    <div class="flex h-full min-h-40 items-center justify-center text-sm text-slate-500">Loading rows...</div>
  {:else if table.loader.error && table.rows.isEmpty}
    <div class="flex h-full min-h-40 items-center justify-center text-sm text-rose-700">
      {table.options.errorLabel ?? table.loader.error}
    </div>
  {:else if table.rows.isEmpty}
    <div class="flex h-full min-h-40 items-center justify-center text-sm text-slate-500">
      {table.options.emptyLabel ?? "No rows found"}
    </div>
  {:else}
    <TableVirtualBody {table} />
  {/if}
</div>
