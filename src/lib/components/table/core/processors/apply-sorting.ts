import type { DatagridCore } from "../index.svelte";
import type { DataTableActiveSortDirection } from "../types";

/**
 * Applies sorting to the given data based on the sort configurations in the datagrid.
 * The function supports manual sorting and sorting defined in the datagrid's sorting feature.
 * It also uses a Schwartzian transform to precompute the sort values for improved performance.
 *
 * @template TOriginalRow - The type of the rows in the data array.
 *
 * @param {DatagridCore<TOriginalRow>} datagrid - The datagrid instance containing the sorting configuration and lifecycle hooks.
 * @param {TOriginalRow[]} data - The data array to be sorted.
 *
 * @returns {TOriginalRow[]} - The sorted data array.
 *
 * @remarks
 * - If manual sorting is enabled or no sorting configurations are defined, the data is returned without any changes.
 * - The sorting respects the direction specified in the active sorts and handles cases for null or undefined values.
 * - The Schwartzian Transform is used for precomputing the values to be sorted, which improves performance when sorting large datasets.
 */
export function applySorting<TOriginalRow>(datagrid: DatagridCore<TOriginalRow>, data: TOriginalRow[]): TOriginalRow[] {
  data = datagrid.lifecycleHooks.executePreSort(data);

  const isManualSortingEnabled = datagrid.features.sorting.isManual;
  const noSorting = datagrid.features.sorting.sorts.length === 0;
  if (isManualSortingEnabled || noSorting) return data;

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
    .filter((sort) => sort !== null) as {
    getValue: (row: TOriginalRow) => any;
    direction: DataTableActiveSortDirection;
  }[];

  // Schwartzian Transform: Precompute sort values
  const decorated = data.map((row) => ({
    row,
    values: sorts.map(({ getValue }) => getValue(row)),
  }));

  datagrid.processors.data.metrics.measure("Sorting", () => {
    decorated.sort((a, b) => {
      for (let i = 0; i < sorts.length; i++) {
        const sort = sorts[i];
        // Check if config exists before using it
        if (!sort) continue;

        const valA = a.values[i];
        const valB = b.values[i];

        if (valA === valB) continue;
        if (valA == null) return sort.direction === "descending" ? 1 : -1;
        if (valB == null) return sort.direction === "descending" ? -1 : 1;

        return sort.direction === "descending" ? (valB > valA ? 1 : -1) : valA > valB ? 1 : -1;
      }
      return 0;
    });
  });

  // Extract sorted data
  return datagrid.lifecycleHooks.executePostSort(decorated.map((d) => d.row));
}
