import { SortDirection, type ErrorResponse } from "$lib/api/index.schemas";
import { fetchContactGroups } from "$lib/api/contact-group/contact-group";
import type { DataTableFetchRequest, DataTableFetchResult } from "$lib/components/data-table";
import {
  contactGroupSortFieldLabelMap,
  contactGroupSortFieldOptions,
  type ContactGroupSortField,
  type ContactGroupSortRule,
  type ContactGroupViewModel,
} from "$lib/features/contact-groups/contact-groups-view-data";
import {
  createMockContactGroups,
  filterMockContactGroups,
  sortContactGroups,
  toContactGroupViewModel,
} from "./contact-groups-display";
import { buildContactGroupRequest } from "./contact-groups-query";

const SEARCH_DEBOUNCE_MS = 250;

export class ContactGroupsState {
  totalRows = $state(0);
  loadingError = $state<string | null>(null);

  search = $state("");
  minContactCount = $state("");
  maxContactCount = $state("");
  sortRules = $state<ContactGroupSortRule[]>([
    {
      id: crypto.randomUUID(),
      field: "name",
      direction: SortDirection.ASC,
    },
  ]);

  filtersOpen = $state(false);
  sortOpen = $state(false);
  tableKey = $state(0);

  private searchTimer: ReturnType<typeof setTimeout> | null = null;
  private loadedRowEstimate = 0;
  private fallbackGroups = createMockContactGroups();

  sortFieldOptions = contactGroupSortFieldOptions;

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

  sortChips = $derived.by(() =>
    this.sortRules.map((rule, index) => `#${index + 1} ${contactGroupSortFieldLabelMap[rule.field]} ${rule.direction}`),
  );

  activeSortCount = $derived(this.sortRules.length);

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

  addSortRule = (): void => {
    const usedFields = new Set(this.sortRules.map((rule) => rule.field));
    const field = this.sortFieldOptions.find((option) => !usedFields.has(option)) ?? this.sortFieldOptions[0];

    this.sortRules = [
      ...this.sortRules,
      {
        id: crypto.randomUUID(),
        field,
        direction: SortDirection.ASC,
      },
    ];

    void this.refreshTable();
  };

  removeSortRule = (ruleId: string): void => {
    const remaining = this.sortRules.filter((rule) => rule.id !== ruleId);
    this.sortRules =
      remaining.length > 0 ? remaining : [{ id: crypto.randomUUID(), field: "name", direction: SortDirection.ASC }];

    void this.refreshTable();
  };

  updateSortRuleField = (ruleId: string, field: ContactGroupSortField): void => {
    this.sortRules = this.sortRules.map((rule) => (rule.id === ruleId ? { ...rule, field } : rule));
    void this.refreshTable();
  };

  updateSortRuleDirection = (ruleId: string, direction: SortDirection): void => {
    this.sortRules = this.sortRules.map((rule) => (rule.id === ruleId ? { ...rule, direction } : rule));
    void this.refreshTable();
  };

  clearSortRules = (): void => {
    this.sortRules = [{ id: crypto.randomUUID(), field: "name", direction: SortDirection.ASC }];
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

  fetchRows = async (request: DataTableFetchRequest): Promise<DataTableFetchResult<ContactGroupViewModel>> => {
    const pageRequest = buildContactGroupRequest({
      pageSize: request.pageSize,
      cursor: request.kind === "cursor" ? request.cursor : null,
      direction: request.kind === "cursor" ? request.direction : undefined,
      offset: request.kind === "page" ? request.pageIndex * request.pageSize : undefined,
      search: this.search,
      minContactCount: this.minContactCount,
      maxContactCount: this.maxContactCount,
      sortRules: this.sortRules,
    });

    try {
      const response = await fetchContactGroups(pageRequest, { credentials: "include" });

      if (response.status !== 200) {
        this.handleResponseError(response.data as ErrorResponse);
        return this.fetchMockRows(request);
      }

      const rows = (response.data.items ?? []).map((item, index) =>
        toContactGroupViewModel(item, request.kind === "page" ? request.pageIndex * request.pageSize + index : index),
      );

      this.loadingError = null;
      this.updateTotalRows(request, rows.length, Boolean(response.data.nextCursor), response.data.size);

      return {
        rows,
        nextCursor: response.data.nextCursor ?? null,
        prevCursor: response.data.prevCursor ?? null,
      };
    } catch {
      this.handleResponseError();
      return this.fetchMockRows(request);
    }
  };

  dispose = (): void => {
    if (!this.searchTimer) {
      return;
    }

    clearTimeout(this.searchTimer);
    this.searchTimer = null;
  };

  private scheduleRefresh(): void {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }

    this.searchTimer = setTimeout(() => {
      void this.refreshTable();
    }, SEARCH_DEBOUNCE_MS);
  }

  private refreshTable(): void {
    this.loadedRowEstimate = 0;
    this.totalRows = 0;
    this.tableKey += 1;
  }

  private get filteredMockGroups(): ContactGroupViewModel[] {
    return sortContactGroups(
      filterMockContactGroups(this.fallbackGroups, this.search, this.minContactCount, this.maxContactCount),
      this.sortRules,
    );
  }

  private fetchMockRows(request: DataTableFetchRequest): DataTableFetchResult<ContactGroupViewModel> {
    const groups = this.filteredMockGroups;
    const start = request.kind === "page" ? request.pageIndex * request.pageSize : 0;
    const rows = groups.slice(start, start + request.pageSize);

    this.loadedRowEstimate = rows.length;
    this.totalRows = groups.length;

    return {
      rows,
      nextCursor: null,
      prevCursor: null,
    };
  }

  private updateTotalRows(
    request: DataTableFetchRequest,
    rowsLength: number,
    hasNextCursor: boolean,
    responseSize: number,
  ): void {
    if (request.kind === "page") {
      this.loadedRowEstimate = request.pageIndex * request.pageSize + rowsLength;
    } else if (request.direction === "next") {
      this.loadedRowEstimate += rowsLength;
    }

    const knownRows = Math.max(responseSize, this.loadedRowEstimate);
    this.totalRows = hasNextCursor ? Math.max(knownRows + request.pageSize, request.pageSize) : knownRows;
  }

  private handleResponseError(error?: ErrorResponse): void {
    this.loadingError =
      error?.errorDescription ??
      "Could not load groups from API. The page is showing local preview data until the backend responds.";
  }
}
