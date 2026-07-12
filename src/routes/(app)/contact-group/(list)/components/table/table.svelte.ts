import { DatagridCore, type DataField, type DataTableSort } from "$lib/components/table";
import type { ContactGroupState } from "$lib/feature/contact-group/contact-group-state.svelte";
import type { ContactGroupViewModel } from "$lib/feature/contact-group/contact-group-view-data";
import { createContactGroupColumns } from "./column.svelte";
import { contactGroupFilterDefinitions } from "./filter.svelte";
import { contactGroupSortDefinitions } from "./sort.svelte";

const PAGE_SIZE = 500;
const initialSorting = [{ sortId: "name", direction: "ascending" }] satisfies DataTableSort[];

interface ContactGroupTableOptions {
  contactGroupState: ContactGroupState;
}

export function createContactGroupTable(props: ContactGroupTableOptions): DatagridCore<ContactGroupViewModel> {
  return new DatagridCore<ContactGroupViewModel>({
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
        sorts: initialSorting,
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
