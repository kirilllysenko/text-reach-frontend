<script lang="ts" generics="TData, TMeta">
  import type { RenderedTable } from "./core/rendered-table";
  import TableCell from "./TableCell.svelte";

  interface Props {
    row: TData;
    rowIndex: number;
    view: RenderedTable<TData, TMeta>;
  }

  let { row, rowIndex, view }: Props = $props();
</script>

<div class={["flex min-w-max border-b border-slate-100", rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50/60"]}>
  {#each view.visibleColumns as column (column.id)}
    <TableCell {column} {row} {rowIndex} {view} />
  {/each}
</div>
