import { createDatagrid, type DataField } from "$lib/components/table";
import type { ContactGroupState } from "$lib/feature/contact-group/contact-group-state.svelte";
import {
  contactGroupSortDefinitions,
  defaultContactGroupSorts,
  type ContactGroupTableSort,
} from "$lib/feature/contact-group/contact-group-sorting";
import type { ContactGroupViewModel } from "$lib/feature/contact-group/contact-group-view-data";
import { createContactGroupColumns } from "./column.svelte";
import { contactGroupFilterDefinitions } from "./filter.svelte";

const PAGE_SIZE = 500;
interface ContactGroupTableOptions {
  contactGroupState: ContactGroupState;
}

export function createContactGroupTable(props: ContactGroupTableOptions) {
  return createDatagrid<ContactGroupViewModel>()({
    columns: createContactGroupColumns(),
    data: [],
    dataFields: createContactGroupDataFields(),
    initialState: {
      dataLoading: {
        loader: (request) => props.contactGroupState.fetchRows(request),
      },
      filtering: {
        filterDefinitions: contactGroupFilterDefinitions,
      },
      pagination: {
        manual: true,
        pageSize: PAGE_SIZE,
      },
      sorting: {
        sortDefinitions: contactGroupSortDefinitions,
        sorts: defaultContactGroupSorts,
      },
    },
    rowIdGetter: (contactGroup) => contactGroup.id,
  });
}

function createContactGroupDataFields(): DataField<ContactGroupViewModel>[] {
  return [
    {
      fieldId: "name",
      getValueFn: (contactGroup) => contactGroup.name,
      sortable: true,
    },
    {
      fieldId: "contactCount",
      getValueFn: (contactGroup) => contactGroup.contactCount,
      filterable: true,
      sortable: true,
    },
  ];
}
