import { ContactsStore } from "$houdini";
import {
  DatagridCore,
  type DataTableLoadRequest,
  type DataTableLoadResult,
  type DataTableSort,
} from "$lib/components/table";
import { toContactViewModel } from "$lib/feature/contact/contact-display";
import { buildContactRequest } from "$lib/feature/contact/contact-query";
import type { ContactViewModel } from "$lib/feature/contact/contact-view-data";
import { abortControllerFromSignal } from "$lib/graphql/abort";
import { toGraphQLErrorText } from "$lib/graphql/errors";
import { contactTableFilters } from "../filter/filter.svelte";
import { contactSortDefinitions, contactTableSorts } from "../sort/sort.svelte";
import { createContactColumns } from "./column.svelte";

const initialSorting = [
  { sortId: "lastName", direction: "ascending" },
  { sortId: "firstName", direction: "ascending" },
] satisfies DataTableSort[];
const contactsQuery = new ContactsStore();

export const table = createContactTable();

function createContactTable(): DatagridCore<ContactViewModel> {
  return new DatagridCore<ContactViewModel>({
    columns: createContactColumns(),
    initialState: {
      dataLoading: {
        loader: fetchContactRows,
      },
      filtering: {
        filterDefinitions: contactTableFilters.definitions,
      },
      sorting: {
        sortDefinitions: contactSortDefinitions,
        sorts: initialSorting,
      },
    },
  });
}

async function fetchContactRows(request: DataTableLoadRequest): Promise<DataTableLoadResult<ContactViewModel>> {
  const filters = contactTableFilters.toDtos(request.filters);
  const pageRequest = buildContactRequest({
    pageSize: request.limit,
    cursor: request.cursor,
    direction: request.direction ?? "next",
    offset: request.offset,
    filters,
    sort: contactTableSorts.toBackend(request.sorts),
  });

  try {
    const response = await contactsQuery.fetch({
      abortController: abortControllerFromSignal(request.signal),
      variables: pageRequest,
    });

    if (response.errors || !response.data) {
      throw new Error(toGraphQLErrorText(response.errors));
    }

    const result = response.data.contacts;

    return {
      rows: result.edges.map((edge, index) => toContactViewModel(edge.node, index)),
      nextCursor: result.pageInfo.hasNextPage ? toCursor(result.pageInfo.endCursor) : null,
      previousCursor: result.pageInfo.hasPreviousPage ? toCursor(result.pageInfo.startCursor) : null,
      totalRows: result.totalCount,
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error("Could not load contacts from API.");
  }
}

function toCursor(cursor: string | null | undefined): unknown[] | null {
  return cursor ? [cursor] : null;
}
