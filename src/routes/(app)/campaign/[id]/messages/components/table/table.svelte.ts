import {
  DatagridCore,
  sortDefinition,
  type DataTableLoadRequest,
  type DataTableLoadResult,
} from "$lib/components/table";
import type { MessageSortByInput } from "$houdini/graphql/inputs";
import type { CampaignMessagesState } from "$lib/feature/message/message-state.svelte";
import { messageTableFilters } from "$lib/feature/message/message-table-filters";
import type { MessageViewModel } from "$lib/feature/message/message-view-data";
import { createMessageColumns } from "./column.svelte";

const initialSorting = [{ sortId: "sentAt", direction: "descending" }] as const;
const definitions = [
  sortDefinition({ sortId: "sentAt", fieldId: "sentAt", label: "Sent At", defaultDirection: "descending" }),
  sortDefinition({ sortId: "status", fieldId: "status", label: "Status" }),
  sortDefinition({
    sortId: "tenantPhoneNumber",
    fieldId: "tenantPhoneNumber",
    label: "Tenant Phone",
  }),
  sortDefinition({ sortId: "text", fieldId: "text", label: "Text" }),
] as const;
const messageTableSorts = {
  definitions,
  toBackend(sorts: readonly { sortId: string; direction: "ascending" | "descending" }[]): MessageSortByInput[] {
    return sorts.map((sort) => ({
      [sort.sortId]: { direction: sort.direction === "ascending" ? "ASC" : "DESC" },
    }));
  },
};

export function createMessageTable(state: CampaignMessagesState): DatagridCore<MessageViewModel> {
  return new DatagridCore<MessageViewModel>({
    columns: createMessageColumns(),
    initialState: {
      dataLoading: {
        loader: (request) => fetchMessageRows(state, request),
      },
      filtering: {
        filterDefinitions: messageTableFilters.definitions,
      },
      sorting: {
        sortDefinitions: messageTableSorts.definitions,
        sorts: [...initialSorting],
      },
    },
  });
}

function fetchMessageRows(
  state: CampaignMessagesState,
  request: DataTableLoadRequest,
): Promise<DataTableLoadResult<MessageViewModel>> {
  return state.fetchRows(request, messageTableSorts.toBackend(request.sorts));
}
