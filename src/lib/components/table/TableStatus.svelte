<script lang="ts" generics="TData, TMeta">
  import type { RenderedTable } from "./core/rendered-table";

  interface Props {
    view: RenderedTable<TData, TMeta>;
  }

  let { view }: Props = $props();
</script>

<div
  class="flex min-h-10 shrink-0 items-center justify-between gap-3 border-t border-slate-200 px-3 text-xs text-slate-500"
>
  <span>{view.statusLabel}</span>

  {#if view.loadingMore}
    <span>Loading more...</span>
  {:else if view.error && !view.table.rows.isEmpty && view.actions.loadMore}
    <button class="hover:text-rose-900 font-medium text-rose-700" type="button" onclick={view.actions.loadMore}>
      Retry loading more
    </button>
  {:else if view.capabilities.canLoadMore && !view.table.rows.hasMore}
    <span>End reached</span>
  {/if}
</div>
