import type { DatagridCore } from "../index.svelte";
import type { GridBasicRow, GridRow, GridRowIdentifier } from "../row-types";

export class RowsManager<TOriginalRow> {
  constructor(private readonly datagrid: DatagridCore<TOriginalRow>) {}

  getVisibleBasicRows(): GridBasicRow<TOriginalRow>[] {
    return this.datagrid.cacheManager.rows.filter((row) => !row.isGroupRow()) as GridBasicRow<TOriginalRow>[];
  }

  getVisibleRows(): GridRow<TOriginalRow>[] {
    return [
      ...this.datagrid.features.rowPinning.getTopRows(),
      ...this.datagrid.features.rowPinning.getCenterRows(),
      ...this.datagrid.features.rowPinning.getBottomRows(),
    ];
  }

  getPaginatedRows(): GridRow<TOriginalRow>[] {
    return this.datagrid.cacheManager.paginatedRows ?? [];
  }

  findRowById(identifier: GridRowIdentifier): GridRow<TOriginalRow> | undefined {
    return this.datagrid.cacheManager.rows.find((row) => row.identifier === identifier);
  }

  flattenGridRows(rows: GridRow<TOriginalRow>[]): GridRow<TOriginalRow>[] {
    return rows.flatMap((row) => [row, ...(row.isGroupRow() ? this.flattenGridRows(row.children) : [])]);
  }
}
