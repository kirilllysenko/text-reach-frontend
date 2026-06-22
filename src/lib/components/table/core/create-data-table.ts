import { DataTableCore } from "./data-table.svelte";
import type { DataTableCoreOptions, DataTableFeature, DataTableWithFeatures } from "./data-table.svelte";
import type { DataTable } from "./rendered-table";

export interface CreateDataTableOptions<
  TData,
  TFeatures extends readonly DataTableFeature<object>[],
> extends DataTableCoreOptions<TData> {
  features: TFeatures;
}

export function createDataTable<TData>(
  options: CreateDataTableOptions<TData, readonly DataTableFeature<object>[]>,
): DataTable<TData>;
export function createDataTable<TData, const TFeatures extends readonly DataTableFeature<object>[]>(
  options: CreateDataTableOptions<TData, TFeatures>,
): DataTableWithFeatures<TData, unknown, TFeatures>;
export function createDataTable<TData>(
  options: CreateDataTableOptions<TData, readonly DataTableFeature<object>[]>,
): DataTableCore<TData> & object {
  const table = new DataTableCore<TData>(options);

  options.features.forEach((feature) => {
    const api = feature.install(table);
    Object.defineProperties(table, Object.getOwnPropertyDescriptors(api));
  });

  return table;
}
