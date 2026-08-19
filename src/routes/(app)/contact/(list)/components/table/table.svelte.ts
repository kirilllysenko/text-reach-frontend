import { ContactTableQueryStore } from "$houdini";
import type { ContactTableQuery$input } from "$houdini/artifacts/ContactTableQuery";
import type { ContactFilterInput, ContactSortByInput } from "$houdini/graphql/inputs";
import {
  dataLoadingFeature,
  DatagridCore,
  filteringFeature,
  rowSelectionFeature,
  sortingFeature,
  type DataTableLoadRequest,
  type DataTableLoadResult,
} from "text-reach-frontend-library/components/table";
import { abortControllerFromSignal } from "$lib/graphql/abort";
import { contactFilterDefinitions } from "../filter/filter.svelte";
import { contactSortDefinitions, initialContactSorts } from "../sort/sort.svelte";
import { createContactColumns, type ContactTableRow } from "./column.svelte";

export function createContactTable(): DatagridCore<ContactTableRow, ContactSortByInput, ContactFilterInput> {
  const contactsQuery = new ContactTableQueryStore();

  return new DatagridCore<ContactTableRow, ContactSortByInput, ContactFilterInput>({
    columns: createContactColumns(),
    features: [
      sortingFeature<ContactSortByInput>({
        definitions: contactSortDefinitions,
        initialSorts: [...initialContactSorts],
      }),
      filteringFeature<ContactFilterInput>({ definitions: contactFilterDefinitions }),
      rowSelectionFeature(),
      dataLoadingFeature<ContactTableRow, ContactSortByInput, ContactFilterInput>({
        combineFilters: combineContactFilters,
        loader: (request) => fetchContactRows(contactsQuery, request),
      }),
    ],
  });
}

async function fetchContactRows(
  contactsQuery: ContactTableQueryStore,
  request: DataTableLoadRequest<ContactSortByInput, ContactFilterInput>,
): Promise<DataTableLoadResult<ContactTableRow>> {
  const variables: ContactTableQuery$input = {
    after: request.after,
    before: request.before,
    filter: request.filter,
    first: request.first,
    last: request.last,
    offset: request.offset,
    sortBy: request.sorts,
  };

  try {
    const response = await contactsQuery.fetch({
      abortController: abortControllerFromSignal(request.signal),
      variables,
    });

    if (response.errors || !response.data) {
      throw new Error("Could not load contacts.");
    }

    const result = response.data.contacts;

    return {
      rows: result.edges.map((edge) => edge.node),
      nextCursor: result.pageInfo.hasNextPage ? (result.pageInfo.endCursor ?? null) : null,
      previousCursor: result.pageInfo.hasPreviousPage ? (result.pageInfo.startCursor ?? null) : null,
      totalRows: result.totalCount,
    };
  } catch {
    throw new Error("Could not load contacts.");
  }
}

function combineContactFilters(filters: ContactFilterInput[]): ContactFilterInput | undefined {
  return filters.length > 0 ? { operator: "AND", nested: filters } : undefined;
}
