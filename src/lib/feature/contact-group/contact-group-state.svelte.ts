import { ContactGroupsStore } from "$houdini";
import type { ContactGroupFilterInput, ContactGroupSortByInput } from "$houdini/graphql/inputs";
import type { DataTableLoadRequest, DataTableLoadResult } from "$lib/components/table";
import type { ContactGroupViewModel } from "$lib/feature/contact-group/contact-group-view-data";
import { abortControllerFromSignal } from "$lib/graphql/abort";
import { toGraphQLErrorText } from "$lib/graphql/errors";
import { toContactGroupViewModel } from "./contact-group-display";
import { buildContactGroupRequest } from "./contact-group-query";

export function createContactGroupState() {
  const contactGroupsQuery = new ContactGroupsStore();
  const state = $state({
    totalRows: 0,
    loadingError: null as string | null,
    search: "",
    fetchRows: async (
      request: DataTableLoadRequest<ContactGroupSortByInput, ContactGroupFilterInput>,
    ): Promise<DataTableLoadResult<ContactGroupViewModel>> => {
      const pageRequest = buildContactGroupRequest({
        pageSize: request.limit,
        cursor: request.cursor,
        direction: request.direction,
        offset: request.offset,
        search: state.search,
        filters: request.filters,
        sort: request.sorts,
      });

      try {
        const response = await contactGroupsQuery.fetch({
          abortController: abortControllerFromSignal(request.signal),
          variables: pageRequest,
        });

        if (response.errors || !response.data) {
          state.loadingError = toGraphQLErrorText(response.errors);
          return emptyRows();
        }

        const result = response.data.contactGroups;
        const rows = result.edges.map((edge, index) => toContactGroupViewModel(edge.node, index));

        state.loadingError = null;
        state.totalRows = result.totalCount;

        return {
          rows,
          nextCursor: result.pageInfo.hasNextPage ? toCursor(result.pageInfo.endCursor) : null,
          previousCursor: result.pageInfo.hasPreviousPage ? toCursor(result.pageInfo.startCursor) : null,
          totalRows: state.totalRows,
        };
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          throw error;
        }

        state.loadingError = "Could not load contact groups from API.";
        return emptyRows();
      }
    },
  });

  function emptyRows(): DataTableLoadResult<ContactGroupViewModel> {
    state.totalRows = 0;
    return { rows: [], nextCursor: null, totalRows: 0 };
  }

  return state;
}

function toCursor(cursor: unknown): unknown[] | null {
  return typeof cursor === "string" ? [cursor] : null;
}

export type ContactGroupState = ReturnType<typeof createContactGroupState>;
