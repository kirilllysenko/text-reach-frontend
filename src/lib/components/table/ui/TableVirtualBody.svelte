<script lang="ts" generics="TData">
  import { VirtualList } from "svelte-virtuallists";
  import type { DatagridCore } from "../core/index.svelte";
  import TableRow from "./TableRow.svelte";

  interface Props {
    table: DatagridCore<TData>;
    height?: string;
  }

  let { table, height = "100%" }: Props = $props();

  const rows = $derived(table.rows.getVisibleBasicRows());
</script>

<div class="h-full overflow-x-auto">
  <VirtualList items={rows} style={`height:${height}`}>
    {#snippet vl_slot({ index, item })}
      <TableRow row={item} rowIndex={Number(index)} {table} />
    {/snippet}
  </VirtualList>
</div>
