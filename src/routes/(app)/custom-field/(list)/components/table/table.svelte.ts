import { CustomFieldsStore } from "$houdini";
import { DatagridCore, filteringFeature, sortingFeature, type DataTableSort } from "text-reach-frontend-library/components/table";
import { customFieldFilterDefinitions } from "../filter/filter.svelte";
import { customFieldSortDefinitions } from "../sort/sort.svelte";
import { createCustomFieldColumns } from "./column.svelte";
import type { CustomFieldTableRow } from "./column.svelte";

const initialSorting = [{ sortId: "name", direction: "ascending" }] satisfies DataTableSort[];

export function createCustomFieldTable(): DatagridCore<CustomFieldTableRow> {
  return new DatagridCore<CustomFieldTableRow>({
    columns: createCustomFieldColumns(),
    data: [],
    features: [
      sortingFeature<DataTableSort>({ definitions: customFieldSortDefinitions, initialSorts: initialSorting }),
      filteringFeature({ definitions: customFieldFilterDefinitions }),
    ],
  });
}

export async function loadCustomFields(): Promise<CustomFieldTableRow[]> {
  const customFieldsQuery = new CustomFieldsStore();

  try {
    const response = await customFieldsQuery.fetch();

    if (response.errors || !response.data) {
      throw new Error("Could not load custom fields.");
    }

    return response.data.customFields;
  } catch {
    throw new Error("Could not load custom fields.");
  }
}
