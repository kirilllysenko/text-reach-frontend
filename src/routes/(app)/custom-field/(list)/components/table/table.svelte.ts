import { DatagridCore, type DataField, type DataTableSort } from "$lib/components/table";
import type { CustomFieldState } from "$lib/feature/custom-field/custom-field-state.svelte";
import type { CustomFieldViewModel } from "$lib/feature/custom-field/custom-field-view-data";
import { createCustomFieldColumns } from "./column.svelte";
import { customFieldSortDefinitions } from "./sort.svelte";

const PAGE_SIZE = 500;
const initialSorting = [{ sortId: "name", direction: "ascending" }] satisfies DataTableSort[];

interface CustomFieldTableOptions {
  customFieldsState: CustomFieldState;
}

export function createCustomFieldTable(props: CustomFieldTableOptions): DatagridCore<CustomFieldViewModel> {
  return new DatagridCore<CustomFieldViewModel>({
    columns: createCustomFieldColumns(),
    data: [],
    dataFields: createCustomFieldDataFields(),
    initialState: {
      dataLoading: {
        loader: (request) => props.customFieldsState.fetchRows(request),
      },
      pagination: {
        manual: true,
        pageSize: PAGE_SIZE,
      },
      sorting: {
        sortDefinitions: customFieldSortDefinitions,
        sorts: initialSorting,
      },
    },
    rowIdGetter: (field) => field.id,
  });
}

function createCustomFieldDataFields(): DataField<CustomFieldViewModel>[] {
  return [
    {
      fieldId: "name",
      getValueFn: (field) => field.name,
      sortable: true,
    },
    {
      fieldId: "type",
      getValueFn: (field) => field.typeLabel,
      sortable: true,
    },
  ];
}
