import { DataTable } from "./data-table.svelte";
import type { DataTableOptions } from "./data-table.svelte";

export function createDataTable<TData, TMeta = unknown>(
  options: DataTableOptions<TData, TMeta>,
): DataTable<TData, TMeta> {
  return new DataTable(options);
}
