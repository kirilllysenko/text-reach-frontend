<script lang="ts" generics="TData">
  import type { DatagridCore } from "../core/index.svelte";

  interface Props {
    table: DatagridCore<TData>;
  }

  let { table }: Props = $props();

  const visibleRows = $derived(table.rows.getVisibleBasicRows().length);
  const totalRows = $derived(table.originalState.data.length);
</script>

<div
  class="flex min-h-10 shrink-0 items-center justify-between gap-3 border-t border-slate-200 px-3 text-xs text-slate-500"
>
  <span>{visibleRows} of {totalRows} rows</span>
</div>
