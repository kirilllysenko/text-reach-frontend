import {
  backendSortDefinition,
  DatagridCore,
  type DataTableLoadRequest,
  type DataTableLoadResult,
} from "$lib/components/table";
import type { MessageFilterInput, MessageSortByInput } from "$houdini/graphql/inputs";
import type { CampaignMessagesState } from "$lib/feature/message/message-state.svelte";
import { messageFilterDefinitions } from "$lib/feature/message/message-table-filters";
import type { MessageViewModel } from "$lib/feature/message/message-view-data";
import { createMessageColumns } from "./column.svelte";

const messageSort = backendSortDefinition<MessageSortByInput>();
const initialSorting = [{ sentAt: { direction: "DESC" } }] satisfies MessageSortByInput[];
const definitions = [
  messageSort({ field: "sentAt", label: "Sent At", defaultDirection: "DESC" }),
  messageSort({ field: "status", label: "Status" }),
  messageSort({
    field: "tenantPhoneNumber",
    label: "Tenant Phone",
  }),
  messageSort({ field: "text", label: "Text" }),
] as const;

export function createMessageTable(
  state: CampaignMessagesState,
): DatagridCore<MessageViewModel, MessageSortByInput, MessageFilterInput> {
  return new DatagridCore<MessageViewModel, MessageSortByInput, MessageFilterInput>({
    columns: createMessageColumns(),
    initialState: {
      dataLoading: {
        loader: (request) => fetchMessageRows(state, request),
      },
      filtering: {
        filterDefinitions: messageFilterDefinitions,
      },
      sorting: {
        sortDefinitions: definitions,
        sorts: [...initialSorting],
      },
    },
  });
}

function fetchMessageRows(
  state: CampaignMessagesState,
  request: DataTableLoadRequest<MessageSortByInput, MessageFilterInput>,
): Promise<DataTableLoadResult<MessageViewModel>> {
  return state.fetchRows(request);
}
