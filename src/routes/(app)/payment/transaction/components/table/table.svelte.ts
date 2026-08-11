import type { WalletTransactionSortByInput } from "$houdini/graphql/inputs";
import { DatagridCore } from "$lib/components/table";
import type { WalletTransactionState } from "$lib/feature/payment/payment-state.svelte";
import { walletTransactionTableFilters } from "$lib/feature/payment/payment-table-filters";
import type { WalletTransactionViewModel } from "$lib/feature/payment/payment-view-data";
import { createTransactionColumns } from "./column.svelte";
import { initialTransactionSorts, transactionSortDefinitions } from "./sort.svelte";

interface TransactionTableOptions {
  transactionState: WalletTransactionState;
}

export function createTransactionTable(
  props: TransactionTableOptions,
): DatagridCore<WalletTransactionViewModel, WalletTransactionSortByInput> {
  return new DatagridCore<WalletTransactionViewModel, WalletTransactionSortByInput>({
    columns: createTransactionColumns(),
    initialState: {
      dataLoading: {
        loader: props.transactionState.fetchRows,
      },
      filtering: {
        filterDefinitions: walletTransactionTableFilters.definitions,
      },
      sorting: {
        sortDefinitions: transactionSortDefinitions,
        sorts: [...initialTransactionSorts],
      },
    },
  });
}
