import { MessagesStore } from "$houdini";
import type { Messages$input } from "$houdini/artifacts/Messages";
import {
  backendSortDefinition,
  dataLoadingFeature,
  DatagridCore,
  filteringFeature,
  sortingFeature,
  type DataTableLoadRequest,
  type DataTableLoadResult,
} from "text-reach-frontend-library/components/table";
import type { MessageFilterInput, MessageSortByInput } from "$houdini/graphql/inputs";
import { abortControllerFromSignal } from "$lib/graphql/abort";
import { messageFilterDefinitions } from "../filter/filter.svelte";
import { buildMessageFilter } from "../message-filter";
import { createMessageColumns, type MessageTableRow } from "./column.svelte";

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

interface MessageTableOptions {
  campaignId: string;
  getSearch: () => string;
  getTenantPhoneId: () => string | null;
}

export function createMessageTable(
  options: MessageTableOptions,
): DatagridCore<MessageTableRow, MessageSortByInput, MessageFilterInput> {
  const messagesQuery = new MessagesStore();

  return new DatagridCore<MessageTableRow, MessageSortByInput, MessageFilterInput>({
    columns: createMessageColumns(),
    features: [
      sortingFeature<MessageSortByInput>({
        definitions,
        initialSorts: [...initialSorting],
      }),
      filteringFeature<MessageFilterInput>({ definitions: messageFilterDefinitions }),
      dataLoadingFeature<MessageTableRow, MessageSortByInput, MessageFilterInput>({
        combineFilters: (filters) =>
          buildMessageFilter({
            campaignId: options.campaignId,
            filters,
            search: options.getSearch(),
            tenantPhoneId: options.getTenantPhoneId(),
          }),
        loader: (request) => fetchMessageRows(messagesQuery, request),
      }),
    ],
  });
}

async function fetchMessageRows(
  messagesQuery: MessagesStore,
  request: DataTableLoadRequest<MessageSortByInput, MessageFilterInput>,
): Promise<DataTableLoadResult<MessageTableRow>> {
  const variables: Messages$input = {
    after: request.after,
    before: request.before,
    filter: request.filter,
    first: request.first,
    last: request.last,
    offset: request.offset,
    sortBy: request.sorts,
  };

  try {
    const response = await messagesQuery.fetch({
      abortController: abortControllerFromSignal(request.signal),
      variables,
    });

    if (response.errors || !response.data) {
      throw new Error("Could not load campaign messages.");
    }

    const result = response.data.messages;
    return {
      rows: result.edges.map((edge) => edge.node),
      nextCursor: result.pageInfo.hasNextPage ? (result.pageInfo.endCursor ?? null) : null,
      previousCursor: result.pageInfo.hasPreviousPage ? (result.pageInfo.startCursor ?? null) : null,
      totalRows: result.totalCount,
    };
  } catch {
    throw new Error("Could not load campaign messages.");
  }
}
