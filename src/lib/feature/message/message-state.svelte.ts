import { SortDirection, type ErrorResponse } from "$lib/api/index.schemas";
import { getPage as getMessagePage } from "$lib/api/message/message";
import type { DataTableFilter, DataTableLoadRequest, DataTableLoadResult, DataTableSort } from "$lib/components/table";
import { toMessageViewModel } from "$lib/feature/message/message-display";
import { buildMessageRequest } from "$lib/feature/message/message-query";
import { debounce } from "$lib/utils/debounce";
import {
  defaultMessageSortRules,
  messageSortFieldLabelMap,
  messageSortFieldOptions,
  type MessageSortField,
  type MessageSortRule,
  type MessageViewModel,
} from "$lib/feature/message/message-view-data";

const SEARCH_DEBOUNCE_MS = 250;

export class CampaignMessagesState {
  loadingError = $state<string | null>(null);
  search = $state("");
  filtersOpen = $state(false);
  sortOpen = $state(false);
  tableKey = $state(0);

  private readonly scheduleRefresh = debounce(() => {
    this.refreshTable();
  }, SEARCH_DEBOUNCE_MS);

  sortFieldOptions = messageSortFieldOptions;

  sortChips = $derived.by(() =>
    defaultMessageSortRules.map(
      (rule, index) => `#${index + 1} ${messageSortFieldLabelMap[rule.field]} ${rule.direction}`,
    ),
  );

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

  fetchRows = async (request: DataTableLoadRequest): Promise<DataTableLoadResult<MessageViewModel>> => {
    const pageRequest = buildMessageRequest({
      campaignId: this.campaignId,
      pageSize: request.limit,
      cursor: request.cursor,
      direction: request.direction,
      search: this.search,
      filters: request.filters,
      sortRules: this.getSortRules(request.sorts),
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

  private getSortRules(sorting: DataTableSort[]): MessageSortRule[] {
    const sortableFields = new Set<MessageSortField>(this.sortFieldOptions);
    const tableSortRules = sorting
      .filter((sort): sort is DataTableSort & { sortId: MessageSortField } =>
        sortableFields.has(sort.sortId as MessageSortField),
      )
      .map((sort) => ({
        id: sort.sortId,
        field: sort.sortId,
        direction: sort.direction === "ascending" ? SortDirection.ASC : SortDirection.DESC,
      }));

    return tableSortRules.length > 0 ? tableSortRules : defaultMessageSortRules;
  }

  private handleResponseError(error?: ErrorResponse): void {
    this.loadingError = error?.errorDescription ?? "Could not load campaign messages.";
  }
}
