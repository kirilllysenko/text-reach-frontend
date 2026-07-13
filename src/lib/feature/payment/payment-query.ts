import {
  ContainmentOperator,
  NestedOperator,
  PageDirection,
  type PageRequestWalletTransactionFilterDtoWalletTransactionSortDto,
  type WalletTransactionFilterDto,
  type WalletTransactionSortDto,
} from "$lib/api/index.schemas";
import type { DataTableFilter } from "$lib/components/table";
import { walletTransactionTableFilters } from "./payment-table-filters";

const ULID_PATTERN = /^[0-9A-HJKMNP-TV-Z]{26}$/i;

interface WalletTransactionRequestOptions {
  pageSize: number;
  cursor: unknown[] | null;
  direction?: "next" | "previous";
  idSearch: string;
  filters: DataTableFilter[];
  sort: WalletTransactionSortDto;
}

export function buildWalletTransactionRequest(
  options: WalletTransactionRequestOptions,
): PageRequestWalletTransactionFilterDtoWalletTransactionSortDto {
  return {
    pageSize: options.pageSize,
    position: buildPosition(options),
    filter: buildWalletTransactionFilter(options.idSearch, options.filters),
    sort: options.sort,
  };
}

export function buildWalletTransactionFilter(
  idSearch: string,
  filters: DataTableFilter[],
): WalletTransactionFilterDto | undefined {
  const nested: WalletTransactionFilterDto[] = [];
  const normalizedIdSearch = idSearch.trim().toUpperCase();

  if (isUlid(normalizedIdSearch)) {
    nested.push({
      operator: NestedOperator.OR,
      nested: [
        {
          id: {
            operator: ContainmentOperator.IN,
            value: [normalizedIdSearch],
          },
        },
        {
          sourceId: {
            operator: ContainmentOperator.IN,
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
    operator: NestedOperator.AND,
    nested,
  };
}

export function isUlid(value: string): boolean {
  return ULID_PATTERN.test(value.trim());
}

function buildPosition(
  options: WalletTransactionRequestOptions,
): PageRequestWalletTransactionFilterDtoWalletTransactionSortDto["position"] {
  if (options.cursor) {
    return {
      type: "SEEK",
      cursor: options.cursor as Record<string, never>[],
      pageDirection: options.direction === "previous" ? PageDirection.PREVIOUS : PageDirection.NEXT,
    };
  }

  return undefined;
}
