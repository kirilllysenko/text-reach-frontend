import type { ErrorResponse } from "$lib/api/index.schemas";
import { fetchContactGroups as fetchContactGroupList } from "$lib/api/contact-group/contact-group";
import type { DataTableFilter, DataTableLoadRequest, DataTableLoadResult } from "$lib/components/table";
import { defaultContactGroupSorts, type ContactGroupTableSort } from "$lib/feature/contact-group/contact-group-sorting";
import type { ContactGroupViewModel } from "$lib/feature/contact-group/contact-group-view-data";
import { debounce } from "$lib/utils/debounce";
import {
  createMockContactGroupList,
  filterMockContactGroupList,
  sortContactGroupList,
  toContactGroupViewModel,
} from "./contact-group-display";
import { buildContactGroupRequest } from "./contact-group-query";

const SEARCH_DEBOUNCE_MS = 250;

export class ContactGroupState {
  totalRows = $state(0);
  loadingError = $state<string | null>(null);

  search = $state("");
  minContactCount = $state("");
  maxContactCount = $state("");
  filtersOpen = $state(false);
  sortOpen = $state(false);
  tableKey = $state(0);

  private readonly scheduleRefresh = debounce(() => {
    void this.refreshTable();
  }, SEARCH_DEBOUNCE_MS);
  private loadedRowEstimate = 0;
  private fallbackGroupList = createMockContactGroupList();

  activeFilterChips = $derived.by(() => {
    const chips: string[] = [];

    if (this.minContactCount) {
      chips.push(`Min contacts: ${this.minContactCount}`);
    }

    if (this.maxContactCount) {
      chips.push(`Max contacts: ${this.maxContactCount}`);
    }

    return chips;
  });

  activeFilterCount = $derived(this.activeFilterChips.length);

  updateSearch = (value: string): void => {
    this.search = value;
    this.scheduleRefresh();
  };

  updateMinContactCount = (value: string): void => {
    this.minContactCount = value;
    void this.refreshTable();
  };

  updateMaxContactCount = (value: string): void => {
    this.maxContactCount = value;
    void this.refreshTable();
  };

  clearFilters = (): void => {
    this.minContactCount = "";
    this.maxContactCount = "";
    void this.refreshTable();
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

  fetchRows = async (
    request: DataTableLoadRequest<ContactGroupTableSort["sortId"]>,
  ): Promise<DataTableLoadResult<ContactGroupViewModel>> => {
    const filters = getContactGroupTableFilters(request.filters);
    const sorts = request.sorts.length > 0 ? request.sorts : defaultContactGroupSorts;
    const pageRequest = buildContactGroupRequest({
      pageSize: request.limit,
      cursor: request.cursor,
      direction: "next",
      search: this.search,
      minContactCount: filters.minContactCount,
      maxContactCount: filters.maxContactCount,
      sorts,
    });

    try {
      const response = await fetchContactGroupList(pageRequest, { credentials: "include", signal: request.signal });

      if (response.status !== 200) {
        this.handleResponseError(response.data as ErrorResponse);
        return this.fetchMockRows(request, sorts);
      }

      const rows = (response.data.items ?? []).map((item, index) => toContactGroupViewModel(item, index));

      this.loadingError = null;
      this.updateTotalRows(
        request.limit,
        request.cursor === null,
        rows.length,
        Boolean(response.data.nextCursor),
        response.data.size,
      );

      return {
        rows,
        nextCursor: response.data.nextCursor ?? null,
        totalRows: this.totalRows,
      };
    } catch {
      this.handleResponseError();
      return this.fetchMockRows(request, sorts);
    }
  };

  dispose = (): void => {
    this.scheduleRefresh.cancel();
  };

  private refreshTable(): void {
    this.loadedRowEstimate = 0;
    this.totalRows = 0;
    this.tableKey += 1;
  }

  private getFilteredMockGroupList(
    filters: DataTableFilter[],
    sorts: readonly ContactGroupTableSort[],
  ): ContactGroupViewModel[] {
    const tableFilters = getContactGroupTableFilters(filters);
    return sortContactGroupList(
      filterMockContactGroupList(
        this.fallbackGroupList,
        this.search,
        tableFilters.minContactCount,
        tableFilters.maxContactCount,
      ),
      sorts,
    );
  }

  private fetchMockRows(
    request: DataTableLoadRequest<ContactGroupTableSort["sortId"]>,
    sorts: readonly ContactGroupTableSort[],
  ): DataTableLoadResult<ContactGroupViewModel> {
    const groups = this.getFilteredMockGroupList(request.filters, sorts);
    const start = Number(request.cursor?.[0] ?? 0);
    const end = start + request.limit;
    const rows = groups.slice(start, end);

    this.loadedRowEstimate = rows.length;
    this.totalRows = groups.length;

    return {
      rows,
      nextCursor: end < groups.length ? [end] : null,
      totalRows: groups.length,
    };
  }

  private updateTotalRows(
    limit: number,
    isInitial: boolean,
    rowsLength: number,
    hasNextCursor: boolean,
    responseSize: number,
  ): void {
    if (isInitial) {
      this.loadedRowEstimate = rowsLength;
    } else {
      this.loadedRowEstimate += rowsLength;
    }

    const knownRows = Math.max(responseSize, this.loadedRowEstimate);
    this.totalRows = hasNextCursor ? Math.max(knownRows + limit, limit) : knownRows;
  }

  private handleResponseError(error?: ErrorResponse): void {
    this.loadingError =
      error?.errorDescription ??
      "Could not load contact groups from API. The page is showing local preview data until the backend responds.";
  }
}

function getContactGroupTableFilters(filters: DataTableFilter[]): {
  maxContactCount: string;
  minContactCount: string;
} {
  const minFilter = filters.find(
    (filter) =>
      filter.type === "comparison" && filter.filterId === "minContactCount" && filter.operator === "GREATER_OR_EQUAL",
  );
  const maxFilter = filters.find(
    (filter) =>
      filter.type === "comparison" && filter.filterId === "maxContactCount" && filter.operator === "LESS_OR_EQUAL",
  );

  return {
    maxContactCount:
      maxFilter?.type === "comparison" && typeof maxFilter.value !== "undefined" ? String(maxFilter.value) : "",
    minContactCount:
      minFilter?.type === "comparison" && typeof minFilter.value !== "undefined" ? String(minFilter.value) : "",
  };
}
