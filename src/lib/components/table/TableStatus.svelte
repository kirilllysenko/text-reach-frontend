<script lang="ts" generics="TData, TMeta">
  import type { DataTable } from "./core/rendered-table";

  interface Props {
    table: DataTable<TData, TMeta>;
  }

  let { table }: Props = $props();
</script>

<div
  class="flex min-h-10 shrink-0 items-center justify-between gap-3 border-t border-slate-200 px-3 text-xs text-slate-500"
>
  <span>{table.statusLabel}</span>

  {#if table.loader.loadingMore}
    <span>Loading more...</span>
  {:else if table.loader.error && !table.rows.isEmpty}
    <button class="hover:text-rose-900 font-medium text-rose-700" type="button" onclick={table.loadMore}>
      Retry loading more
    </button>
  {:else if !table.rows.hasMore}
    <span>End reached</span>
  {/if}
</div>
