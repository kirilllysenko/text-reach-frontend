import { createDatagrid, type DataField, type DatagridCore } from "$lib/components/table";
import type { CustomFieldState } from "$lib/feature/custom-field/custom-field-state.svelte";
import {
  customFieldSortDefinitions,
  defaultCustomFieldSorts,
  type CustomFieldTableSort,
  type CustomFieldViewModel,
} from "$lib/feature/custom-field/custom-field-view-data";
import { createCustomFieldColumns } from "./column.svelte";

const PAGE_SIZE = 500;

interface CustomFieldTableOptions {
  customFieldsState: CustomFieldState;
}

export function createCustomFieldTable(
  props: CustomFieldTableOptions,
): DatagridCore<CustomFieldViewModel, unknown, CustomFieldTableSort["sortId"]> {
  return createDatagrid<CustomFieldViewModel>()({
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
        sorts: defaultCustomFieldSorts,
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
