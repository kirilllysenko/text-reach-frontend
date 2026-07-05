import type { ErrorResponse } from "$lib/api/index.schemas";
import { countContacts as countContactList, fetchContacts as fetchContactList } from "$lib/api/contact/contact";
import type { DataTableFilter, DataTableLoadRequest, DataTableLoadResult, DataTableSort } from "$lib/components/table";
import type { ContactViewModel } from "$lib/feature/contact/contact-view-data";
import { buildContactFilter, buildContactRequest } from "./contact-query";
import { createMockContactList, filterMockContactList, sortContactList, toContactViewModel } from "./contact-display";
import { getContactSortRules, getContactTableFilters } from "./contact-table-query";

const SEARCH_DEBOUNCE_MS = 250;

export class ContactTableState {
  totalRows = $state(0);
  loadingError = $state<string | null>(null);
  search = $state("");
  tableKey = $state(0);

  private searchTimer: ReturnType<typeof setTimeout> | null = null;
  private fallbackContactList = createMockContactList();

  constructor() {
    void this.refreshCount();
  }

  updateSearch = (value: string): void => {
    this.search = value;
    this.scheduleRefresh();
  };

  refresh = (): void => {
    this.tableKey += 1;
  };

  fetchRows = async (request: DataTableLoadRequest): Promise<DataTableLoadResult<ContactViewModel>> => {
    const filters = getContactTableFilters(request.filters);

    if (request.cursor === null) {
      await this.refreshCount(request.filters);
    }

    const pageRequest = buildContactRequest({
      pageSize: request.limit,
      cursor: request.cursor,
      direction: "next",
      search: this.search,
      contactGroupIds: filters.contactGroupIds,
      birthdayAfter: filters.birthdayAfter,
      emailContains: filters.emailContains,
      sortRules: getContactSortRules(request.sorting),
    });

    try {
      const response = await fetchContactList(pageRequest, { credentials: "include", signal: request.signal });

      if (response.status !== 200) {
        this.handleResponseError(response.data as ErrorResponse);
        return this.fetchMockRows(request);
      }

      this.loadingError = null;

      return {
        rows: (response.data.items ?? []).map((item, index) => toContactViewModel(item, index)),
        nextCursor: response.data.nextCursor ?? null,
        totalRows: this.totalRows,
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
      this.refresh();
    }, SEARCH_DEBOUNCE_MS);
  }

  private async refreshCount(filters: DataTableFilter[] = []): Promise<void> {
    const tableFilters = getContactTableFilters(filters);
    const filter = buildContactFilter({
      search: this.search,
      contactGroupIds: tableFilters.contactGroupIds,
      birthdayAfter: tableFilters.birthdayAfter,
      emailContains: tableFilters.emailContains,
    });

    try {
      const response = await countContactList(filter ?? {}, { credentials: "include" });

      if (response.status !== 200) {
        this.handleResponseError(response.data as ErrorResponse);
        this.totalRows = this.getFilteredMockContactList(filters, []).length;
        return;
      }

      this.loadingError = null;
      this.totalRows = response.data;
    } catch {
      this.handleResponseError();
      this.totalRows = this.getFilteredMockContactList(filters, []).length;
    }
  }

  private getFilteredMockContactList(filters: DataTableFilter[], sorting: DataTableSort[]): ContactViewModel[] {
    const tableFilters = getContactTableFilters(filters);
    return sortContactList(
      filterMockContactList(
        this.fallbackContactList,
        this.search,
        tableFilters.contactGroupIds,
        tableFilters.birthdayAfter,
        tableFilters.emailContains,
      ),
      getContactSortRules(sorting),
    );
  }

  private fetchMockRows(request: DataTableLoadRequest): DataTableLoadResult<ContactViewModel> {
    const contacts = this.getFilteredMockContactList(request.filters, request.sorting);
    const start = Number(request.cursor?.[0] ?? 0);
    const end = start + request.limit;
    const rows = contacts.slice(start, end);

    this.totalRows = contacts.length;

    return {
      rows,
      nextCursor: end < contacts.length ? [end] : null,
      totalRows: contacts.length,
    };
  }

  private handleResponseError(error?: ErrorResponse): void {
    this.loadingError =
      error?.errorDescription ??
      "Could not load contacts from API. The page is showing local preview data until the backend responds.";
  }
}
