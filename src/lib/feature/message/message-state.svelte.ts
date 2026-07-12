import type { ErrorResponse } from "$lib/api/index.schemas";
import { getPage as getMessagePage } from "$lib/api/message/message";
import type { DataTableLoadRequest, DataTableLoadResult } from "$lib/components/table";
import { toMessageViewModel } from "$lib/feature/message/message-display";
import { buildMessageRequest } from "$lib/feature/message/message-query";
import { debounce } from "$lib/utils/debounce";
import {
  defaultMessageSorts,
  type MessageSortId,
  type MessageTableSort,
  type MessageViewModel,
} from "$lib/feature/message/message-view-data";

const SEARCH_DEBOUNCE_MS = 250;

export function resolveMessageSorts(sorts: readonly MessageTableSort[]): readonly MessageTableSort[] {
  return sorts.length > 0 ? sorts : defaultMessageSorts;
}

export class CampaignMessagesState {
  loadingError = $state<string | null>(null);
  search = $state("");
  filtersOpen = $state(false);
  sortOpen = $state(false);
  tableKey = $state(0);

  private readonly scheduleRefresh = debounce(() => {
    this.refreshTable();
  }, SEARCH_DEBOUNCE_MS);

  constructor(private readonly campaignId: string) {}

  updateSearch = (value: string): void => {
    this.search = value;
    this.scheduleRefresh();
  };

  openFilters = (): void => {
    this.filtersOpen = !this.filtersOpen;
    if (this.filtersOpen) {
      this.sortOpen = false;
    }
  };

  openSort = (): void => {
    this.sortOpen = !this.sortOpen;
    if (this.sortOpen) {
      this.filtersOpen = false;
    }
  };

  closeOverlays = (): void => {
    this.filtersOpen = false;
    this.sortOpen = false;
  };

  fetchRows = async (request: DataTableLoadRequest<MessageSortId>): Promise<DataTableLoadResult<MessageViewModel>> => {
    const pageRequest = buildMessageRequest({
      campaignId: this.campaignId,
      pageSize: request.limit,
      cursor: request.cursor,
      direction: request.direction,
      search: this.search,
      filters: request.filters,
      sorts: resolveMessageSorts(request.sorts),
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

  dispose = (): void => {
    this.scheduleRefresh.cancel();
  };

  private refreshTable(): void {
    this.tableKey += 1;
  }

  private estimateTotalRows(
    request: DataTableLoadRequest<MessageSortId>,
    rowCount: number,
    nextCursor: unknown[] | null,
  ): number {
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
