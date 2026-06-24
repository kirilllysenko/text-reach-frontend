<script lang="ts" generics="TData, TMeta">
  import { VirtualList } from "svelte-virtuallists";
  import type { RenderedTable } from "./core/rendered-table";
  import TableRow from "./TableRow.svelte";

  interface Props {
    view: RenderedTable<TData, TMeta>;
  }

  let { view }: Props = $props();
</script>

<div class="h-full overflow-x-auto">
  <VirtualList
    items={view.rows}
    style={`height:${view.virtualHeight}`}
    onVisibleRangeUpdate={(range) => view.actions.updateVirtualRange?.(range)}
  >
    {#snippet vl_slot({ index, item })}
      <TableRow row={item} rowIndex={Number(index)} {view} />
    {/snippet}
  </VirtualList>
</div>
