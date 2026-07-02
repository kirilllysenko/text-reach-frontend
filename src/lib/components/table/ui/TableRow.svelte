<script lang="ts" generics="TData">
  import type { DatagridCore } from "../core/index.svelte";
  import type { GridBasicRow } from "../core/types";
  import TableCell from "./TableCell.svelte";

  interface Props {
    row: GridBasicRow<TData>;
    rowIndex: number;
    table: DatagridCore<TData>;
  }

  let { row, rowIndex, table }: Props = $props();

  const visibleColumns = $derived(table.columns.getLeafColumnsInOrder().filter((column) => column.isVisible()));
</script>

<div class={["flex w-max min-w-full border-b border-slate-100", rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50/60"]}>
  {#each visibleColumns as column (column.columnId)}
    <TableCell {column} {row} {rowIndex} {table} />
  {/each}
</div>
