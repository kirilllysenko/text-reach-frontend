import { getNestedValue, setNestedValue } from "../column-creation/utils";
import type { AccessorColumn } from "../column-types";
import type { GridBasicRow } from "../row-types";
import { BaseService } from "./base-service";

export class EditingService<TOriginalRow = any> extends BaseService<TOriginalRow> {
  updateCellValue(
    row: GridBasicRow<TOriginalRow>,
    column: AccessorColumn<TOriginalRow>,
    value: unknown,
    rowIdentifier: keyof TOriginalRow = "id" as keyof TOriginalRow,
  ): void {
    const previousValue = getNestedValue(row.original, column.accessorKey);
    const previousRow = { ...row.original };
    const nextData = this.datagrid.originalState.data.map((originalRow) => {
      if (originalRow[rowIdentifier] !== row.identifier) return originalRow;
      return setNestedValue(originalRow, column.accessorKey, value) as TOriginalRow;
    });

    this.datagrid.originalState = {
      columns: this.datagrid.originalState.columns,
      data: nextData,
    };
    this.datagrid.refresh(() => this.datagrid.cacheManager.invalidate("everything"), { recalculateAll: true });

    this.datagrid.events.emit("onCellEdit", {
      newOriginalRow: nextData.find((currentRow) => currentRow[rowIdentifier] === row.identifier),
      prevOriginalRow: previousRow,
      prevValue: previousValue,
      newValue: value,
      column,
    });
  }
}
