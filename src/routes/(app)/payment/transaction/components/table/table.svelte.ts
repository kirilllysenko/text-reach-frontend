import { DatagridCore, type DataTableSort } from "$lib/components/table";
import type { WalletTransactionState } from "$lib/feature/payment/payment-state.svelte";
import { walletTransactionTableFilters } from "$lib/feature/payment/payment-table-filters";
import type { WalletTransactionViewModel } from "$lib/feature/payment/payment-view-data";
import { createTransactionColumns } from "./column.svelte";
import { transactionSortDefinitions, transactionTableSorts } from "./sort.svelte";

const initialSorting = [{ sortId: "createdAt", direction: "descending" }] satisfies DataTableSort[];

interface TransactionTableOptions {
  transactionState: WalletTransactionState;
}

export function createTransactionTable(props: TransactionTableOptions): DatagridCore<WalletTransactionViewModel> {
  return new DatagridCore<WalletTransactionViewModel>({
    columns: createTransactionColumns(),
    initialState: {
      dataLoading: {
        loader: (request) => props.transactionState.fetchRows(request, transactionTableSorts.toBackend(request.sorts)),
      },
      filtering: {
        filterDefinitions: walletTransactionTableFilters.definitions,
      },
      sorting: {
        sortDefinitions: transactionSortDefinitions,
        sorts: initialSorting,
      },
    },
  });
}
