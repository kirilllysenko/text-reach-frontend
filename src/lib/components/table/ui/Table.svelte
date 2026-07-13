<script lang="ts" generics="TData">
  import { onMount } from "svelte";
  import type { DatagridCore } from "../core/index.svelte";
  import TableBody from "./TableBody.svelte";
  import TableHeader from "./TableHeader.svelte";
  import TableStatus from "./TableStatus.svelte";
  import { getColumnSizeRootStyle } from "./column-size-style";

  interface Props {
    table: DatagridCore<TData>;
    error?: string | null;
    loading?: boolean;
  }

  let { table, error = null, loading = false }: Props = $props();

  const visibleColumns = $derived(table.columns.getLeafColumnsInOrder().filter((column) => column.isVisible()));
  const columnSizeStyle = $derived(getColumnSizeRootStyle(visibleColumns));

  onMount(() => {
    table.handlers.dataLoading.start();
    return () => table.handlers.dataLoading.dispose();
  });
</script>

<div class="flex h-full min-h-0 flex-col overflow-hidden bg-white" data-table-root style={columnSizeStyle}>
  <TableHeader {table} />
  <TableBody {table} {error} {loading} />
  <TableStatus {table} />
</div>
