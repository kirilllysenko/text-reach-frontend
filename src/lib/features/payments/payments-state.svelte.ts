import { SortDirection, type ErrorResponse, type WalletBalanceDto } from "$lib/api/index.schemas";
import { countTransactions, getBalance, listTransactions } from "$lib/api/default/default";
import type { DataTableFilter, DataTableLoadRequest, DataTableLoadResult, DataTableSort } from "$lib/components/table";
import { toWalletTransactionViewModel } from "./payments-display";
import { buildWalletTransactionFilter, buildWalletTransactionRequest, isUlid } from "./payments-query";
import {
  defaultWalletTransactionSortRules,
  walletTransactionSortFieldLabelMap,
  walletTransactionSortFieldOptions,
  type WalletTransactionSortField,
  type WalletTransactionSortRule,
  type WalletTransactionViewModel,
} from "./payments-view-data";

const SEARCH_DEBOUNCE_MS = 250;

export class PaymentsOverviewState {
  balance = $state<WalletBalanceDto | null>(null);
  loading = $state(false);
  loadingError = $state<string | null>(null);

  load = async (): Promise<void> => {
    this.loading = true;

    try {
      const response = await getBalance({ credentials: "include" });

      if (response.status !== 200) {
        this.handleResponseError(response.data as ErrorResponse);
        return;
      }

      this.balance = response.data;
      this.loadingError = null;
    } catch {
      this.handleResponseError();
    } finally {
      this.loading = false;
    }
  };

  private handleResponseError(error?: ErrorResponse): void {
    this.loadingError = error?.errorDescription ?? "Could not load payment balance.";
    this.balance = null;
  }
}

export class WalletTransactionsState {
  totalRows = $state(0);
  loadingError = $state<string | null>(null);
  idSearch = $state("");

  filtersOpen = $state(false);
  sortOpen = $state(false);
  tableKey = $state(0);

  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  sortFieldOptions = walletTransactionSortFieldOptions;

  activeIdSearchIsInvalid = $derived(Boolean(this.idSearch.trim()) && !isUlid(this.idSearch));

  sortChips = $derived.by(() =>
    defaultWalletTransactionSortRules.map(
      (rule, index) => `#${index + 1} ${walletTransactionSortFieldLabelMap[rule.field]} ${rule.direction}`,
    ),
  );

  updateIdSearch = (value: string): void => {
    this.idSearch = value;
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

  fetchRows = async (request: DataTableLoadRequest): Promise<DataTableLoadResult<WalletTransactionViewModel>> => {
    const sortRules = this.getSortRules(request.sorting);
    const filter = buildWalletTransactionFilter(this.idSearch, request.filters);

    if (request.cursor === null) {
      await this.refreshCount(filter);
    }

    const pageRequest = buildWalletTransactionRequest({
      pageSize: request.limit,
      cursor: request.cursor,
      direction: "next",
      idSearch: this.idSearch,
      filters: request.filters,
      sortRules,
    });

    try {
      const response = await listTransactions(pageRequest, { credentials: "include", signal: request.signal });

      if (response.status !== 200) {
        this.handleResponseError(response.data as ErrorResponse);
        return this.emptyResult();
      }

      this.loadingError = null;

      return {
        rows: (response.data.items ?? []).map(toWalletTransactionViewModel),
        nextCursor: response.data.nextCursor ?? null,
        totalRows: this.totalRows,
      };
    } catch {
      this.handleResponseError();
      return this.emptyResult();
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
      this.refreshTable();
    }, SEARCH_DEBOUNCE_MS);
  }

  private refreshTable(): void {
    this.totalRows = 0;
    this.tableKey += 1;
  }

  private async refreshCount(filter: ReturnType<typeof buildWalletTransactionFilter>): Promise<void> {
    try {
      const response = await countTransactions(filter ?? {}, { credentials: "include" });

      if (response.status !== 200) {
        this.handleResponseError(response.data as ErrorResponse);
        this.totalRows = 0;
        return;
      }

      this.totalRows = response.data;
      this.loadingError = null;
    } catch {
      this.handleResponseError();
      this.totalRows = 0;
    }
  }

  private emptyResult(): DataTableLoadResult<WalletTransactionViewModel> {
    return {
      rows: [],
      nextCursor: null,
      totalRows: 0,
    };
  }

  private getSortRules(sorting: DataTableSort[]): WalletTransactionSortRule[] {
    const sortableFields = new Set<WalletTransactionSortField>(this.sortFieldOptions);
    const tableSortRules = sorting
      .filter((sort): sort is DataTableSort & { sortId: WalletTransactionSortField } =>
        sortableFields.has(sort.sortId as WalletTransactionSortField),
      )
      .map((sort) => ({
        id: sort.sortId,
        field: sort.sortId,
        direction: sort.direction === "ascending" ? SortDirection.ASC : SortDirection.DESC,
      }));

    return tableSortRules.length > 0 ? tableSortRules : defaultWalletTransactionSortRules;
  }

  private handleResponseError(error?: ErrorResponse): void {
    this.loadingError = error?.errorDescription ?? "Could not load wallet transactions.";
  }
}
