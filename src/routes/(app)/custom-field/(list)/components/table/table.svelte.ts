import { CustomFieldsStore } from "$houdini";
import {
  DatagridCore,
  filteringFeature,
  globalSearchFeature,
  sortingFeature,
  type DataTableSort,
} from "text-reach-frontend-library/components/table";
import { customFieldFilterDefinitions } from "../filter/filter.svelte";
import { customFieldSortDefinitions } from "../sort/sort.svelte";
import { createCustomFieldColumns } from "./column.svelte";
import type { CustomFieldTableRow } from "./column.svelte";

const initialSorting = [{ sortId: "name", direction: "ascending" }] satisfies DataTableSort[];

interface CustomFieldTable {
  query: CustomFieldsStore;
  table: DatagridCore<CustomFieldTableRow>;
}

export function createCustomFieldTable(): CustomFieldTable {
  const query = new CustomFieldsStore();
  const table = new DatagridCore<CustomFieldTableRow>({
    columns: createCustomFieldColumns(),
    data: [],
    features: [
      sortingFeature<DataTableSort>({ definitions: customFieldSortDefinitions, initialSorts: initialSorting }),
      filteringFeature({ definitions: customFieldFilterDefinitions }),
      globalSearchFeature({ isFuzzySearchEnabled: false }),
    ],
  });

  return { query, table };
}
