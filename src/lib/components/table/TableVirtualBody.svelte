<script lang="ts" generics="TData, TMeta">
  import { VirtualList } from "svelte-virtuallists";
  import type { DataTable } from "./core/data-table.svelte";
  import TableRow from "./TableRow.svelte";

  interface Props {
    table: DataTable<TData, TMeta>;
  }

  let { table }: Props = $props();
</script>

<div class="h-full overflow-x-auto">
  <VirtualList
    items={table.visibleRows}
    style={`height:${table.options.infinite?.height ?? "100%"}`}
    onVisibleRangeUpdate={(range) => table.virtual.updateRange(range)}
  >
    {#snippet vl_slot({ index, item })}
      <TableRow row={item} rowIndex={Number(index)} {table} />
    {/snippet}
  </VirtualList>
</div>
