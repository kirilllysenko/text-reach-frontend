import { ContactGroupsStore } from "$houdini";
import type { MultiComboboxLoadRequest, MultiComboboxLoadResult, MultiComboboxOption } from "$lib/components/dropdown";
import { abortControllerFromSignal } from "$lib/graphql/abort";
import { buildContactGroupRequest } from "./contact-group-query";

const contactGroupsQuery = new ContactGroupsStore();

export async function loadContactGroupComboboxOptions(
  request: MultiComboboxLoadRequest,
): Promise<MultiComboboxLoadResult> {
  try {
    const response = await contactGroupsQuery.fetch({
      abortController: abortControllerFromSignal(request.signal),
      variables: buildContactGroupRequest({
        pageSize: request.pageSize,
        cursor: request.cursor,
        direction: "next",
        search: request.search,
        filters: [],
        sort: [{ name: { direction: "ASC" } }],
      }),
    });

    if (response.errors || !response.data) {
      return emptyContactGroupOptions();
    }

    const result = response.data.contactGroups;
    return {
      items: result.edges.map((edge) => toContactGroupOption(edge.node)),
      nextCursor: result.pageInfo.hasNextPage ? toCursor(result.pageInfo.endCursor) : null,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    return emptyContactGroupOptions();
  }
}

function toCursor(cursor: unknown): unknown[] | null {
  return typeof cursor === "string" ? [cursor] : null;
}

function toContactGroupOption(group: { id: string; name: string }): MultiComboboxOption {
  return {
    value: group.id,
    display: group.name,
  };
}

function emptyContactGroupOptions(): MultiComboboxLoadResult {
  return {
    items: [],
    nextCursor: null,
  };
}
