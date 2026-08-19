import { WalletTransactionsStore } from "$houdini";
import type { WalletTransactions$input } from "$houdini/artifacts/WalletTransactions";
import type { WalletTransactionFilterInput, WalletTransactionSortByInput } from "$houdini/graphql/inputs";
import {
  dataLoadingFeature,
  DatagridCore,
  filteringFeature,
  sortingFeature,
  type DataTableLoadRequest,
  type DataTableLoadResult,
} from "text-reach-frontend-library/components/table";
import { abortControllerFromSignal } from "$lib/graphql/abort";
import { walletTransactionFilterDefinitions } from "../filter/filter.svelte";
import { createTransactionColumns, type WalletTransactionTableRow } from "./column.svelte";
import { initialTransactionSorts, transactionSortDefinitions } from "./sort.svelte";

const ULID_PATTERN = /^[0-9A-HJKMNP-TV-Z]{26}$/i;

interface TransactionTableOptions {
  getIdSearch: () => string;
}

export function createTransactionTable(
  options: TransactionTableOptions,
): DatagridCore<WalletTransactionTableRow, WalletTransactionSortByInput, WalletTransactionFilterInput> {
  const walletTransactionsQuery = new WalletTransactionsStore();

  return new DatagridCore<WalletTransactionTableRow, WalletTransactionSortByInput, WalletTransactionFilterInput>({
    columns: createTransactionColumns(),
    features: [
      sortingFeature<WalletTransactionSortByInput>({
        definitions: transactionSortDefinitions,
        initialSorts: [...initialTransactionSorts],
      }),
      filteringFeature<WalletTransactionFilterInput>({ definitions: walletTransactionFilterDefinitions }),
      dataLoadingFeature<WalletTransactionTableRow, WalletTransactionSortByInput, WalletTransactionFilterInput>({
        combineFilters: (filters) => combineTransactionFilters(options.getIdSearch(), filters),
        loader: (request) => fetchTransactionRows(walletTransactionsQuery, request),
      }),
    ],
  });
}

export function isWalletTransactionId(value: string): boolean {
  return ULID_PATTERN.test(value.trim());
}

async function fetchTransactionRows(
  walletTransactionsQuery: WalletTransactionsStore,
  request: DataTableLoadRequest<WalletTransactionSortByInput, WalletTransactionFilterInput>,
): Promise<DataTableLoadResult<WalletTransactionTableRow>> {
  const variables: WalletTransactions$input = {
    after: request.after,
    before: request.before,
    filter: request.filter,
    first: request.first,
    last: request.last,
    offset: request.offset,
    sortBy: request.sorts,
  };

  try {
    const response = await walletTransactionsQuery.fetch({
      abortController: abortControllerFromSignal(request.signal),
      variables,
    });

    if (response.errors || !response.data) {
      throw new Error("Could not load wallet transactions.");
    }

    const result = response.data.walletTransactions;
    return {
      rows: result.edges.map((edge) => edge.node),
      nextCursor: result.pageInfo.hasNextPage ? (result.pageInfo.endCursor ?? null) : null,
      previousCursor: result.pageInfo.hasPreviousPage ? (result.pageInfo.startCursor ?? null) : null,
      totalRows: result.totalCount,
    };
  } catch {
    throw new Error("Could not load wallet transactions.");
  }
}

function combineTransactionFilters(
  idSearch: string,
  filters: WalletTransactionFilterInput[],
): WalletTransactionFilterInput | undefined {
  const nested = [...filters];
  const normalizedIdSearch = idSearch.trim().toUpperCase();

  if (isWalletTransactionId(normalizedIdSearch)) {
    nested.unshift({
      operator: "OR",
      nested: [{ id: { in: [normalizedIdSearch] } }, { sourceId: { in: [normalizedIdSearch] } }],
    });
  }

  return nested.length > 0 ? { operator: "AND", nested } : undefined;
}
