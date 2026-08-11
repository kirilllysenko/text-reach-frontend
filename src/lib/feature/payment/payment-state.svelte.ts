import { PaymentOverviewStore, WalletTransactionsStore } from "$houdini";
import type { WalletTransactionSortByInput } from "$houdini/graphql/inputs";
import type { DataTableLoadRequest, DataTableLoadResult } from "$lib/components/table";
import { toWalletTransactionViewModel, type WalletBalanceData } from "./payment-display";
import { buildWalletTransactionFilter, buildWalletTransactionRequest, isUlid } from "./payment-query";
import type { WalletTransactionViewModel } from "./payment-view-data";

export class PaymentOverviewState {
  private readonly paymentOverviewQuery = new PaymentOverviewStore();
  balance = $state<WalletBalanceData | null>(null);
  loading = $state(false);
  loadingError = $state<string | null>(null);

  load = async (): Promise<void> => {
    this.loading = true;

    try {
      const response = await this.paymentOverviewQuery.fetch();

      if (response.errors || !response.data) {
        this.handleResponseError();
        return;
      }

      this.balance = response.data.walletBalance;
      this.loadingError = null;
    } catch {
      this.handleResponseError();
    } finally {
      this.loading = false;
    }
  };

  private handleResponseError(): void {
    this.loadingError = "Could not load payment balance.";
    this.balance = null;
  }
}

export class WalletTransactionState {
  private readonly walletTransactionsQuery = new WalletTransactionsStore();
  totalRows = $state(0);
  loadingError = $state<string | null>(null);
  idSearch = $state("");

  activeIdSearchIsInvalid = $derived(Boolean(this.idSearch.trim()) && !isUlid(this.idSearch));

  fetchRows = async (
    request: DataTableLoadRequest<WalletTransactionSortByInput>,
  ): Promise<DataTableLoadResult<WalletTransactionViewModel>> => {
    const filter = buildWalletTransactionFilter(this.idSearch, request.filters);

    const pageRequest = buildWalletTransactionRequest({
      pageSize: request.limit,
      cursor: request.cursor,
      direction: "next",
      idSearch: this.idSearch,
      filters: request.filters,
      sort: request.sorts,
    });

    try {
      const response = await this.walletTransactionsQuery.fetch({ variables: pageRequest });

      if (response.errors || !response.data) {
        this.handleResponseError();
        return this.emptyResult();
      }

      this.loadingError = null;
      const result = response.data.walletTransactions;

      return {
        rows: result.edges.map((edge) => toWalletTransactionViewModel(edge.node)),
        nextCursor: result.pageInfo.hasNextPage && result.pageInfo.endCursor ? [result.pageInfo.endCursor] : null,
        previousCursor:
          result.pageInfo.hasPreviousPage && result.pageInfo.startCursor ? [result.pageInfo.startCursor] : null,
        totalRows: result.totalCount,
      };
    } catch {
      this.handleResponseError();
      return this.emptyResult();
    }
  };

  private emptyResult(): DataTableLoadResult<WalletTransactionViewModel> {
    return {
      rows: [],
      nextCursor: null,
      totalRows: 0,
    };
  }

  private handleResponseError(): void {
    this.loadingError = "Could not load wallet transactions.";
  }
}
