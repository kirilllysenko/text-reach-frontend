import {
  SortDirection,
  type ErrorResponse,
  type ComparisonFilterString,
  type ContainmentFilterUlid,
  type TextFilter,
  NestedOperator,
} from "$lib/api/index.schemas";
import { countContacts as countContactList, fetchContacts as fetchContactList } from "$lib/api/contact/contact";
import type { DataTableFilter, DataTableLoadRequest, DataTableLoadResult, DataTableSort } from "$lib/components/table";
import {
  createMockContactList,
  filterMockContactList,
  sortContactList,
  toContactViewModel,
} from "$lib/feature/contact/contact-display";
import { buildContactFilter, buildContactRequest } from "$lib/feature/contact/contact-query";
import {
  contactSortFieldOptions,
  type ContactSortField,
  type ContactSortRule,
  type ContactViewModel,
} from "$lib/feature/contact/contact-view-data";

const SEARCH_DEBOUNCE_MS = 250;

export class ContactTableState {
  totalRows = $state(0);
  loadingError = $state<string | null>(null);
  search = $state("");
  tableKey = $state(0);

  private searchTimer: ReturnType<typeof setTimeout> | null = null;

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
    if (request.cursor === null) {
      await this.refreshCount();
    }

    const pageRequest = buildContactRequest({
      pageSize: request.limit,
      cursor: request.cursor,
      direction: "next",
      search: this.search,
      contactGroupIds: [],
      birthdayAfter: "",
      emailContains: "",
      sortRules: [],
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
    try {
      const response = await countContactList({}, { credentials: "include" });

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

  private handleResponseError(error?: ErrorResponse): void {
    this.loadingError =
      error?.errorDescription ??
      "Could not load contacts from API. The page is showing local preview data until the backend responds.";
  }
}
