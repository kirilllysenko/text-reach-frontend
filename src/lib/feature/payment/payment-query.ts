import type { WalletTransactionFilterInput, WalletTransactionSortByInput } from "$houdini/graphql/inputs";

const ULID_PATTERN = /^[0-9A-HJKMNP-TV-Z]{26}$/i;

interface WalletTransactionRequestOptions {
  pageSize: number;
  cursor: unknown[] | null;
  direction?: "next" | "previous";
  idSearch: string;
  filters: WalletTransactionFilterInput[];
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
  filters: WalletTransactionFilterInput[],
): WalletTransactionFilterInput | undefined {
  const nested: WalletTransactionFilterInput[] = [];
  const normalizedIdSearch = idSearch.trim().toUpperCase();

  if (isUlid(normalizedIdSearch)) {
    nested.push({
      operator: "OR",
      nested: [
        {
          id: { in: [normalizedIdSearch] },
        },
        {
          sourceId: { in: [normalizedIdSearch] },
        },
      ],
    });
  }

  nested.push(...filters);

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
