import type { ContactGroupFilterInput, ContactGroupSortByInput } from "$houdini/graphql/inputs";
import { DatagridCore } from "$lib/components/table";
import type { ContactGroupState } from "$lib/feature/contact-group/contact-group-state.svelte";
import type { ContactGroupViewModel } from "$lib/feature/contact-group/contact-group-view-data";
import { createContactGroupColumns } from "./column.svelte";
import { contactGroupFilterDefinitions } from "$lib/feature/contact-group/contact-group-table-filters";
import { contactGroupSortDefinitions, initialContactGroupSorts } from "./sort.svelte";

interface ContactGroupTableOptions {
  contactGroupState: ContactGroupState;
}

export function createContactGroupTable(
  props: ContactGroupTableOptions,
): DatagridCore<ContactGroupViewModel, ContactGroupSortByInput, ContactGroupFilterInput> {
  return new DatagridCore<ContactGroupViewModel, ContactGroupSortByInput, ContactGroupFilterInput>({
    columns: createContactGroupColumns(),
    initialState: {
      dataLoading: {
        loader: props.contactGroupState.fetchRows,
      },
      filtering: {
        filterDefinitions: contactGroupFilterDefinitions,
      },
      sorting: {
        sortDefinitions: contactGroupSortDefinitions,
        sorts: [...initialContactGroupSorts],
      },
    },
  });
}
