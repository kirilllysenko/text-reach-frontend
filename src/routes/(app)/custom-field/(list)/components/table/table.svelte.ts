import { DatagridCore, type DataTableSort } from "$lib/components/table";
import type { CustomFieldState } from "$lib/feature/custom-field/custom-field-state.svelte";
import type { CustomFieldViewModel } from "$lib/feature/custom-field/custom-field-view-data";
import { createCustomFieldColumns } from "./column.svelte";
import { customFieldFilterDefinitions } from "./filter.svelte";
import { customFieldSortDefinitions } from "./sort.svelte";

const initialSorting = [{ sortId: "name", direction: "ascending" }] satisfies DataTableSort[];

interface CustomFieldTableOptions {
  customFieldsState: CustomFieldState;
}

export function createCustomFieldTable(props: CustomFieldTableOptions): DatagridCore<CustomFieldViewModel> {
  return new DatagridCore<CustomFieldViewModel>({
    columns: createCustomFieldColumns(),
    initialState: {
      dataLoading: {
        loader: (request) => props.customFieldsState.fetchRows(request),
      },
      filtering: {
        filterDefinitions: customFieldFilterDefinitions,
      },
      sorting: {
        sortDefinitions: customFieldSortDefinitions,
        sorts: initialSorting,
      },
    },
  });
}
