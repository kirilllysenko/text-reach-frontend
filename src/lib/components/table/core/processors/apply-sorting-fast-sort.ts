import { inPlaceSort } from "fast-sort";
import type { DatagridCore } from "../index.svelte";
import type { DataTableActiveSortDirection } from "../types";

/**
 * Applies sorting to the given data based on the sort configurations in the datagrid using the fast-sort library.
 * It supports both manual sorting and sorting as defined by the datagrid's sorting feature.
 * This implementation also optimizes sorting performance by using precomputed sort keys and a Schwartzian transform.
 *
 * @template TOriginalRow - The type of the rows in the data array.
 *
 * @param {DatagridCore<TOriginalRow, any, any>} datagrid - The datagrid instance containing the sorting configuration, lifecycle hooks, and feature flags.
 * @param {TOriginalRow[]} data - The data array to be sorted.
 *
 * @returns {TOriginalRow[]} - The sorted data array.
 *
 * @remarks
 * - If manual sorting is enabled or if there are no sorting configurations, the data is returned without any changes.
 * - Sorting is applied based on active sort directions, handling ascending or descending order.
 * - The Schwartzian Transform is used to precompute the sort keys, which improves performance when sorting large datasets.
 * - The sorting operation uses the fast-sort library's in-place sort mechanism, which efficiently sorts the data by comparing precomputed keys.
 */
export function applySorting<TOriginalRow>(datagrid: DatagridCore<TOriginalRow, any, any>, data: TOriginalRow[]): TOriginalRow[] {
  data = datagrid.lifecycleHooks.executePreSort(data);

  const isManualSortingEnabled = datagrid.features.sorting.isManual;
  const noSorting = datagrid.features.sorting.sorts.length === 0;
  if (isManualSortingEnabled || noSorting) return data;

  // Build active sorts and precompute keys.
  const sorts = datagrid.features.sorting.sorts
    .map((sort) => {
      const fieldId = datagrid.features.sorting.getSortFieldId(sort);
      const field = datagrid.dataFields.findFieldByIdOrThrow(fieldId);
      if (field.sortable === false) {
        return null;
      }
      return {
        getValue: (row: TOriginalRow) => field.getValueFn(row),
        direction: sort.direction,
      };
    })
    .filter(Boolean) as { getValue: (row: TOriginalRow) => any; direction: DataTableActiveSortDirection }[];

  // Decorate each row with its precomputed sort keys.
  const decorated = data.map((row) => ({
    row,
    keys: sorts.map((sort) => sort.getValue(row)),
  }));

  // Create fast-sort instructions that operate on the decorated keys.
  // (Precompute the instruction array once, using the key index.)
  const instructions = sorts.map((sort, i) =>
    sort.direction === "descending"
      ? { desc: (d: { keys: any[] }) => d.keys[i] }
      : { asc: (d: { keys: any[] }) => d.keys[i] },
  );

  datagrid.processors.data.metrics.measure("Sorting", () => {
    // Use fast-sort to sort the decorated array.
    // fast-sort’s inPlaceSort now only compares precomputed keys.
    inPlaceSort(decorated).by(instructions as any);
  });

  // Undecorate.
  const sortedData = decorated.map((d) => d.row);
  return datagrid.lifecycleHooks.executePostSort(sortedData);
}
