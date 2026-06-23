import { getCellValue, normalizeColumns } from "../columns";
import type { DataTableColumn, DataTableColumnDef } from "../columns";
import type { DataTableFeature } from "../data-table.svelte";

export interface ColumnFeatureOptions<TData, TMeta = unknown> {
  columns: DataTableColumnDef<TData, TMeta>[];
}

export interface ColumnFeatureApi<TData, TMeta = unknown> {
  column: ColumnFeature<TData, TMeta>;
}

export class ColumnFeature<TData, TMeta = unknown> {
  definitions = $state<DataTableColumn<TData, TMeta>[]>([]);

  constructor(columns: DataTableColumnDef<TData, TMeta>[]) {
    this.definitions = normalizeColumns(columns);
  }

  find(columnId: string): DataTableColumn<TData, TMeta> | undefined {
    return this.definitions.find((column) => column.id === columnId);
  }

  getCellValue(row: TData, column: DataTableColumn<TData, TMeta>): unknown {
    return getCellValue(row, column);
  }

  getLeafColumns(): DataTableColumn<TData, TMeta>[] {
    return this.definitions;
  }
}

export function columnFeature<TData, TMeta = unknown>(
  options: ColumnFeatureOptions<TData, TMeta>,
): DataTableFeature<ColumnFeatureApi<TData, TMeta>> {
  return {
    dependencies: [],
    id: "column",
    install() {
      return {
        column: new ColumnFeature(options.columns),
      };
    },
  };
}
