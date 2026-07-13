import {
  DatagridCore,
  TableBackendSort,
  type DataTableLoadRequest,
  type DataTableLoadResult,
} from "$lib/components/table";
import type { MessageSortDto } from "$lib/api/index.schemas";
import type { CampaignMessagesState } from "$lib/feature/message/message-state.svelte";
import { messageTableFilters } from "$lib/feature/message/message-table-filters";
import type { MessageViewModel } from "$lib/feature/message/message-view-data";
import { createMessageColumns } from "./column.svelte";

const initialSorting = [{ sortId: "sentAt", direction: "descending" }] as const;
const messageSort = new TableBackendSort<MessageSortDto>();
const messageTableSorts = messageSort.define([
  messageSort.sort({ sortId: "sentAt", fieldId: "sentAt", label: "Sent At", defaultDirection: "descending" }),
  messageSort.sort({ sortId: "status", fieldId: "status", label: "Status" }),
  messageSort.sort({
    sortId: "tenantPhoneNumber",
    fieldId: "tenantPhoneNumber",
    label: "Tenant Phone",
  }),
  messageSort.sort({ sortId: "text", fieldId: "text", label: "Text" }),
] as const);

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
