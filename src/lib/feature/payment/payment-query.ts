import type { WalletTransactionFilterInput, WalletTransactionSortByInput } from "$houdini/graphql/inputs";
import type { DataTableFilter } from "$lib/components/table";
import { walletTransactionTableFilters } from "./payment-table-filters";

const ULID_PATTERN = /^[0-9A-HJKMNP-TV-Z]{26}$/i;

interface WalletTransactionRequestOptions {
  pageSize: number;
  cursor: unknown[] | null;
  direction?: "next" | "previous";
  idSearch: string;
  filters: DataTableFilter[];
  sort: readonly WalletTransactionSortByInput[];
}

export function buildWalletTransactionRequest(options: WalletTransactionRequestOptions) {
  const cursor = typeof options.cursor?.[0] === "string" ? options.cursor[0] : undefined;
  return {
    filter: buildWalletTransactionFilter(options.idSearch, options.filters),
    sortBy: [...options.sort],
    ...(cursor && options.direction === "previous"
      ? { before: cursor, last: options.pageSize }
      : { after: cursor, first: options.pageSize }),
  };
}

export function buildWalletTransactionFilter(
  idSearch: string,
  filters: DataTableFilter[],
): WalletTransactionFilterInput | undefined {
  const nested: WalletTransactionFilterInput[] = [];
  const normalizedIdSearch = idSearch.trim().toUpperCase();

  if (isUlid(normalizedIdSearch)) {
    nested.push({
      operator: "OR",
      nested: [
        {
          nested: [],
          operator: "AND",
          id: {
            operator: "IN",
            value: [normalizedIdSearch],
          },
        },
        {
          nested: [],
          operator: "AND",
          sourceId: {
            operator: "IN",
            value: [normalizedIdSearch],
          },
        },
      ],
    });
  }

  nested.push(...walletTransactionTableFilters.toDtos(filters));

  if (nested.length === 0) {
    return undefined;
  }

  return {
    operator: "AND",
    nested,
  };
}

export function isUlid(value: string): boolean {
  return ULID_PATTERN.test(value.trim());
}
