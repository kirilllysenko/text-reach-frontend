<script lang="ts" generics="TRow">
  import type { DataTableRenderedColumn } from "./data-table-types";

  interface Props {
    columns: DataTableRenderedColumn<TRow>[];
    gridTemplate: string;
    top: number;
    height: number;
    tableWidth: number;
    rowIndex: number;
  }

  let { columns, gridTemplate, top, height, tableWidth, rowIndex }: Props = $props();

  function chipWidth(columnIndex: number): string {
    const widths = ["58%", "74%", "42%", "66%", "50%"];
    return widths[(rowIndex + columnIndex) % widths.length] ?? "60%";
  }
</script>

<div
  class="absolute top-0 left-0 grid border-b border-slate-100 bg-white"
  style={`width:${tableWidth}px;height:${height}px;transform:translateY(${top}px);grid-template-columns:${gridTemplate};`}
  role="row"
  aria-hidden="true"
>
  {#each columns as column, columnIndex (column.id)}
    <div class="flex min-w-0 items-center border-r border-slate-100 px-3" role="gridcell">
      <span class="h-3 rounded-full bg-slate-200" style={`width:${chipWidth(columnIndex)};`}></span>
    </div>
  {/each}
</div>
