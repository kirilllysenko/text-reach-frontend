<script lang="ts" generics="TData, TMeta">
  import type { Component } from "svelte";
  import type { RenderedTable } from "./core/rendered-table";
  import type { DataTableCellComponentProps, DataTableColumn } from "./core/columns";

  interface Props {
    column: DataTableColumn<TData, TMeta>;
    row: TData;
    rowIndex: number;
    view: RenderedTable<TData, TMeta>;
  }

  let { column, row, rowIndex, view }: Props = $props();

  const value = $derived(view.getCellValue(row, column));
  const formattedValue = $derived(column.format ? column.format(value, row) : formatFallbackValue(value));
  const CellComponent = $derived(column.cell as Component<DataTableCellComponentProps<TData>> | undefined);

  function formatFallbackValue(nextValue: unknown): string {
    if (nextValue === null || typeof nextValue === "undefined") {
      return "";
    }

    return String(nextValue);
  }
</script>

<div
  class={[
    "min-h-11 overflow-hidden border-r border-slate-100 px-3 py-2 text-sm text-ellipsis whitespace-nowrap text-slate-700",
    column.grow ? "grow" : "shrink-0",
  ]}
  style={`width:${column.size}px;min-width:${column.minSize}px;max-width:${column.grow ? "none" : `${column.maxSize}px`}`}
>
  {#if CellComponent}
    <CellComponent {column} {row} {rowIndex} table={view.table} {value} />
  {:else}
    {formattedValue}
  {/if}
</div>
