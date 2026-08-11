import { MessagesStore } from "$houdini";
import type { MessageFilterInput, MessageSortByInput } from "$houdini/graphql/inputs";
import type { DataTableLoadRequest, DataTableLoadResult } from "$lib/components/table";
import { toMessageViewModel } from "$lib/feature/message/message-display";
import { buildMessageRequest } from "$lib/feature/message/message-query";
import type { MessageViewModel } from "$lib/feature/message/message-view-data";
import { abortControllerFromSignal } from "$lib/graphql/abort";
import { toGraphQLErrorText } from "$lib/graphql/errors";

export class CampaignMessagesState {
  private readonly messagesQuery = new MessagesStore();
  loadingError = $state<string | null>(null);
  search = $state("");

  constructor(private readonly campaignId: string) {}

  fetchRows = async (
    request: DataTableLoadRequest<MessageSortByInput, MessageFilterInput>,
  ): Promise<DataTableLoadResult<MessageViewModel>> => {
    const pageRequest = buildMessageRequest({
      campaignId: this.campaignId,
      pageSize: request.limit,
      cursor: request.cursor,
      direction: request.direction,
      search: this.search,
      filters: request.filters,
      sort: request.sorts,
    });

    try {
      const response = await this.messagesQuery.fetch({
        abortController: abortControllerFromSignal(request.signal),
        variables: pageRequest,
      });

      if (response.errors || !response.data) {
        this.handleResponseError(toGraphQLErrorText(response.errors));
        return this.emptyResult();
      }

      this.loadingError = null;

      const result = response.data.messages;
      const rows = result.edges.map((edge) => toMessageViewModel(edge.node));
      const nextCursor = result.pageInfo.hasNextPage && result.pageInfo.endCursor ? [result.pageInfo.endCursor] : null;

      return {
        rows,
        nextCursor,
        previousCursor:
          result.pageInfo.hasPreviousPage && result.pageInfo.startCursor ? [result.pageInfo.startCursor] : null,
        totalRows: result.totalCount,
      };
    } catch {
      this.handleResponseError();
      return this.emptyResult();
    }
  };

  private emptyResult(): DataTableLoadResult<MessageViewModel> {
    return {
      rows: [],
      nextCursor: null,
      totalRows: 0,
    };
  }

  private handleResponseError(error?: string): void {
    this.loadingError = error ?? "Could not load campaign messages.";
  }
}
