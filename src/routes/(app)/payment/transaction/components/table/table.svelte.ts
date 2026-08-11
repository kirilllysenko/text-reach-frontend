import type { WalletTransactionFilterInput, WalletTransactionSortByInput } from "$houdini/graphql/inputs";
import { DatagridCore } from "$lib/components/table";
import type { WalletTransactionState } from "$lib/feature/payment/payment-state.svelte";
import { walletTransactionFilterDefinitions } from "$lib/feature/payment/payment-table-filters";
import type { WalletTransactionViewModel } from "$lib/feature/payment/payment-view-data";
import { createTransactionColumns } from "./column.svelte";
import { initialTransactionSorts, transactionSortDefinitions } from "./sort.svelte";

interface TransactionTableOptions {
  transactionState: WalletTransactionState;
}

export function createTransactionTable(
  props: TransactionTableOptions,
): DatagridCore<WalletTransactionViewModel, WalletTransactionSortByInput, WalletTransactionFilterInput> {
  return new DatagridCore<WalletTransactionViewModel, WalletTransactionSortByInput, WalletTransactionFilterInput>({
    columns: createTransactionColumns(),
    initialState: {
      dataLoading: {
        loader: props.transactionState.fetchRows,
      },
      filtering: {
        filterDefinitions: walletTransactionFilterDefinitions,
      },
      sorting: {
        sortDefinitions: transactionSortDefinitions,
        sorts: [...initialTransactionSorts],
      },
    },
  });
}
