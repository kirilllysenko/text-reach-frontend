import { ContactGroupsStore } from "$houdini";
import type { ContactGroups$input } from "$houdini/artifacts/ContactGroups";
import type { ContactGroupFilterInput, ContactGroupSortByInput } from "$houdini/graphql/inputs";
import {
  dataLoadingFeature,
  DatagridCore,
  filteringFeature,
  sortingFeature,
  type DataTableLoadRequest,
  type DataTableLoadResult,
} from "text-reach-frontend-library/components/table";
import { abortControllerFromSignal } from "$lib/graphql/abort";
import { contactGroupFilterDefinitions } from "../filter/filter.svelte";
import { createContactGroupColumns } from "./column.svelte";
import { contactGroupSortDefinitions, initialContactGroupSorts } from "./sort.svelte";
import type { ContactGroupTableRow } from "./column.svelte";

interface ContactGroupTableOptions {
  getSearch: () => string;
}

export function createContactGroupTable(
  options: ContactGroupTableOptions,
): DatagridCore<ContactGroupTableRow, ContactGroupSortByInput, ContactGroupFilterInput> {
  const contactGroupsQuery = new ContactGroupsStore();

  return new DatagridCore<ContactGroupTableRow, ContactGroupSortByInput, ContactGroupFilterInput>({
    columns: createContactGroupColumns(),
    features: [
      sortingFeature<ContactGroupSortByInput>({
        definitions: contactGroupSortDefinitions,
        initialSorts: [...initialContactGroupSorts],
      }),
      filteringFeature<ContactGroupFilterInput>({ definitions: contactGroupFilterDefinitions }),
      dataLoadingFeature<ContactGroupTableRow, ContactGroupSortByInput, ContactGroupFilterInput>({
        combineFilters: (filters) => combineContactGroupFilters(options.getSearch(), filters),
        loader: (request) => fetchContactGroupRows(contactGroupsQuery, request),
      }),
    ],
  });
}

async function fetchContactGroupRows(
  contactGroupsQuery: ContactGroupsStore,
  request: DataTableLoadRequest<ContactGroupSortByInput, ContactGroupFilterInput>,
): Promise<DataTableLoadResult<ContactGroupTableRow>> {
  const variables: ContactGroups$input = {
    after: request.after,
    before: request.before,
    filter: request.filter,
    first: request.first,
    last: request.last,
    offset: request.offset,
    sortBy: request.sorts,
  };

  try {
    const response = await contactGroupsQuery.fetch({
      abortController: abortControllerFromSignal(request.signal),
      variables,
    });

    if (response.errors || !response.data) {
      throw new Error("Could not load contact groups.");
    }

    const result = response.data.contactGroups;
    return {
      rows: result.edges.map((edge) => edge.node),
      nextCursor: result.pageInfo.hasNextPage ? (result.pageInfo.endCursor ?? null) : null,
      previousCursor: result.pageInfo.hasPreviousPage ? (result.pageInfo.startCursor ?? null) : null,
      totalRows: result.totalCount,
    };
  } catch {
    throw new Error("Could not load contact groups.");
  }
}

function combineContactGroupFilters(
  search: string,
  filters: ContactGroupFilterInput[],
): ContactGroupFilterInput | undefined {
  const nested = [...filters];
  const normalizedSearch = search.trim();

  if (normalizedSearch) {
    nested.unshift({ name: { contains: normalizedSearch } });
  }

  return nested.length > 0 ? { nested, operator: "AND" } : undefined;
}
