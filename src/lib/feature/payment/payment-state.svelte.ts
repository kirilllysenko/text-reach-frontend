import type { ErrorResponse, WalletBalanceDto, WalletTransactionSortDto } from "$lib/api/index.schemas";
import {
  countTransactions as countTransactionList,
  getBalance,
  listTransactions as listTransactionList,
} from "$lib/api/default/default";
import type { DataTableLoadRequest, DataTableLoadResult } from "$lib/components/table";
import { toWalletTransactionViewModel } from "./payment-display";
import { buildWalletTransactionFilter, buildWalletTransactionRequest, isUlid } from "./payment-query";
import type { WalletTransactionViewModel } from "./payment-view-data";

export class PaymentOverviewState {
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

export class WalletTransactionState {
  totalRows = $state(0);
  loadingError = $state<string | null>(null);
  idSearch = $state("");

  activeIdSearchIsInvalid = $derived(Boolean(this.idSearch.trim()) && !isUlid(this.idSearch));

  fetchRows = async (
    request: DataTableLoadRequest,
    sort: WalletTransactionSortDto,
  ): Promise<DataTableLoadResult<WalletTransactionViewModel>> => {
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
      sort,
    });

    try {
      const response = await listTransactionList(pageRequest, { credentials: "include", signal: request.signal });

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

  private async refreshCount(filter: ReturnType<typeof buildWalletTransactionFilter>): Promise<void> {
    try {
      const response = await countTransactionList(filter ?? {}, { credentials: "include" });

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

  private handleResponseError(error?: ErrorResponse): void {
    this.loadingError = error?.errorDescription ?? "Could not load wallet transactions.";
  }
}
