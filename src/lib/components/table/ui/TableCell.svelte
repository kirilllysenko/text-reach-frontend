<script lang="ts" generics="TData">
  import type { Component } from "svelte";
  import type { DatagridCore } from "../core/index.svelte";
  import type { CustomCellComponentWithProps, CustomCellProps, LeafColumn } from "../core/column-types";
  import type { CellValue } from "../core/data-types";
  import type { GridBasicRow } from "../core/row-types";
  import { getCellContent, isCellComponent } from "../core/utils.svelte";
  import { getColumnSizeStyle } from "./column-size-style";

  interface Props {
    column: LeafColumn<TData>;
    row: GridBasicRow<TData>;
    rowIndex: number;
    table: DatagridCore<TData, any>;
  }

  let { column, row, rowIndex, table }: Props = $props();

  const cellContent = $derived(getRenderedCellContent());
  const CellComponent = $derived(
    isCellComponent(cellContent) ? (cellContent.component as Component<CustomCellProps<TData>>) : undefined,
  );
  const cellProps = $derived((isCellComponent(cellContent) ? cellContent.props : {}) as Record<string, unknown>);

  function formatFallbackValue(nextValue: unknown): string {
    if (nextValue === null || typeof nextValue === "undefined") {
      return "";
    }

    return String(nextValue);
  }

  function getRenderedCellContent(): CellValue | HTMLElement | CustomCellComponentWithProps {
    if (column.type === "display") {
      return column.cell({
        column,
        datagrid: table,
        row,
      });
    }

    return getCellContent(column, row.original);
  }
</script>

<div
  class={[
    `min-h-11 overflow-hidden border-r border-slate-100 px-3 py-2 text-sm text-ellipsis whitespace-nowrap
    text-slate-700`,
    "shrink-0",
    "grow-0",
    "last:border-r-0",
  ]}
  style={getColumnSizeStyle(column)}
>
  {#if CellComponent}
    <CellComponent datagrid={table} {column} {row} {...cellProps} />
  {:else if typeof cellContent === "string"}
    {cellContent}
  {:else}
    {formatFallbackValue(cellContent)}
  {/if}
</div>
