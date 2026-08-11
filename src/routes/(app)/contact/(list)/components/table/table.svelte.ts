import { ContactTableQueryStore } from "$houdini";
import type { ContactTableQuery$input } from "$houdini/artifacts/ContactTableQuery";
import type { ContactFilterInput, ContactSortByInput } from "$houdini/graphql/inputs";
import { DatagridCore, type DataTableLoadRequest, type DataTableLoadResult } from "$lib/components/table";
import { abortControllerFromSignal } from "$lib/graphql/abort";
import { contactFilterDefinitions } from "../filter/filter.svelte";
import { contactSortDefinitions, initialContactSorts } from "../sort/sort.svelte";
import { createContactColumns, type ContactTableRow } from "./column.svelte";

export function createContactTable(): DatagridCore<ContactTableRow, ContactSortByInput, ContactFilterInput> {
  const contactsQuery = new ContactTableQueryStore();

  return new DatagridCore<ContactTableRow, ContactSortByInput, ContactFilterInput>({
    columns: createContactColumns(),
    initialState: {
      dataLoading: {
        loader: (request) => fetchContactRows(contactsQuery, request),
      },
      filtering: {
        filterDefinitions: contactFilterDefinitions,
      },
      sorting: {
        sortDefinitions: contactSortDefinitions,
        sorts: [...initialContactSorts],
      },
    },
  });
}

async function fetchContactRows(
  contactsQuery: ContactTableQueryStore,
  request: DataTableLoadRequest<ContactSortByInput, ContactFilterInput>,
): Promise<DataTableLoadResult<ContactTableRow>> {
  const cursor = typeof request.cursor?.[0] === "string" ? request.cursor[0] : undefined;
  const variables: ContactTableQuery$input = {
    filter: request.filters.length > 0 ? { operator: "AND", nested: request.filters } : undefined,
    sortBy: request.sorts,
    ...(cursor && request.direction === "previous"
      ? { before: cursor, last: request.limit }
      : { after: cursor, first: request.limit }),
    ...(cursor ? {} : { offset: request.offset }),
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
      nextCursor: result.pageInfo.hasNextPage ? toCursor(result.pageInfo.endCursor) : null,
      previousCursor: result.pageInfo.hasPreviousPage ? toCursor(result.pageInfo.startCursor) : null,
      totalRows: result.totalCount,
    };
  } catch {
    throw new Error("Could not load contacts.");
  }
}

function toCursor(cursor: string | null | undefined): unknown[] | null {
  return cursor ? [cursor] : null;
}
