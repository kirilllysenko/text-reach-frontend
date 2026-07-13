import { DatagridCore, type DataTableSort } from "$lib/components/table";
import type { ContactGroupState } from "$lib/feature/contact-group/contact-group-state.svelte";
import type { ContactGroupViewModel } from "$lib/feature/contact-group/contact-group-view-data";
import { createContactGroupColumns } from "./column.svelte";
import { contactGroupFilterDefinitions } from "./filter.svelte";
import { contactGroupSortDefinitions, contactGroupTableSorts } from "./sort.svelte";

const initialSorting = [{ sortId: "name", direction: "ascending" }] satisfies DataTableSort[];

interface ContactGroupTableOptions {
  contactGroupState: ContactGroupState;
}

export function createContactGroupTable(props: ContactGroupTableOptions): DatagridCore<ContactGroupViewModel> {
  return new DatagridCore<ContactGroupViewModel>({
    columns: createContactGroupColumns(),
    initialState: {
      dataLoading: {
        loader: (request) =>
          props.contactGroupState.fetchRows(request, contactGroupTableSorts.toBackend(request.sorts)),
      },
      filtering: {
        filterDefinitions: contactGroupFilterDefinitions,
      },
      sorting: {
        sortDefinitions: contactGroupSortDefinitions,
        sorts: initialSorting,
      },
    },
  });
}
