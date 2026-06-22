<script lang="ts" generics="TData, TMeta">
  import type { DataTable } from "./core/data-table.svelte";
  import TableCell from "./TableCell.svelte";

  interface Props {
    row: TData;
    rowIndex: number;
    table: DataTable<TData, TMeta>;
  }

  let { row, rowIndex, table }: Props = $props();
</script>

<div class={["flex min-w-max border-b border-slate-100", rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50/60"]}>
  {#each table.visibleColumns as column (column.id)}
    <TableCell {column} {row} {table} />
  {/each}
</div>
