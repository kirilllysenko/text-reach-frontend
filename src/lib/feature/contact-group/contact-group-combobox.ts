import { fetchContactGroups as fetchContactGroupList } from "$lib/api/contact-group/contact-group";
import { SortDirection } from "$lib/api/index.schemas";
import type { MultiComboboxLoadRequest, MultiComboboxLoadResult, MultiComboboxOption } from "$lib/components/dropdown";
import { buildContactGroupRequest } from "./contact-group-query";

export async function loadContactGroupComboboxOptions(
  request: MultiComboboxLoadRequest,
): Promise<MultiComboboxLoadResult> {
  try {
    const response = await fetchContactGroupList(
      buildContactGroupRequest({
        pageSize: request.pageSize,
        cursor: request.cursor,
        direction: "next",
        search: request.search,
        minContactCount: "",
        maxContactCount: "",
        sortRules: [
          {
            id: "name",
            field: "name",
            direction: SortDirection.ASC,
          },
        ],
      }),
      { credentials: "include", signal: request.signal },
    );

    if (response.status !== 200) {
      return emptyContactGroupOptions();
    }

    return {
      items: (response.data.items ?? []).map(toContactGroupOption),
      nextCursor: response.data.nextCursor ?? null,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    return emptyContactGroupOptions();
  }
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
