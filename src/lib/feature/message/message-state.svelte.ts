import type { ErrorResponse, MessageSortDto } from "$lib/api/index.schemas";
import { getPage as getMessagePage } from "$lib/api/message/message";
import type { DataTableLoadRequest, DataTableLoadResult } from "$lib/components/table";
import { toMessageViewModel } from "$lib/feature/message/message-display";
import { buildMessageRequest } from "$lib/feature/message/message-query";
import type { MessageViewModel } from "$lib/feature/message/message-view-data";

export class CampaignMessagesState {
  loadingError = $state<string | null>(null);
  search = $state("");

  constructor(private readonly campaignId: string) {}

  fetchRows = async (
    request: DataTableLoadRequest,
    sort: MessageSortDto,
  ): Promise<DataTableLoadResult<MessageViewModel>> => {
    const pageRequest = buildMessageRequest({
      campaignId: this.campaignId,
      pageSize: request.limit,
      cursor: request.cursor,
      direction: request.direction,
      search: this.search,
      filters: request.filters,
      sort,
    });

    try {
      const response = await getMessagePage(pageRequest, { credentials: "include", signal: request.signal });

      if (response.status !== 200) {
        this.handleResponseError(response.data as ErrorResponse);
        return this.emptyResult();
      }

      this.loadingError = null;

      const rows = (response.data.items ?? []).map(toMessageViewModel);
      const nextCursor = response.data.nextCursor ?? null;

      return {
        rows,
        nextCursor,
        totalRows: this.estimateTotalRows(request, rows.length, nextCursor),
      };
    } catch {
      this.handleResponseError();
      return this.emptyResult();
    }
  };

  private estimateTotalRows(request: DataTableLoadRequest, rowCount: number, nextCursor: unknown[] | null): number {
    const offset = request.offset ?? 0;
    return offset + rowCount + (nextCursor ? 1 : 0);
  }

  private emptyResult(): DataTableLoadResult<MessageViewModel> {
    return {
      rows: [],
      nextCursor: null,
      totalRows: 0,
    };
  }

  private handleResponseError(error?: ErrorResponse): void {
    this.loadingError = error?.errorDescription ?? "Could not load campaign messages.";
  }
}
