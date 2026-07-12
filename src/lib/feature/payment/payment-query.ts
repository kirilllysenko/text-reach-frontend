import {
  ComparisonOperator,
  ContainmentOperator,
  NestedOperator,
  PageDirection,
  TextOperator,
  type PageRequestWalletTransactionFilterDtoWalletTransactionSortDto,
  type WalletTransactionFilterDto,
} from "$lib/api/index.schemas";
import type { DataTableFilter } from "$lib/components/table";
import { tableSortsToDto } from "$lib/utils/table-sort";
import { dollarsToUsdMicros } from "./payment-display";
import { defaultWalletTransactionSorts, type WalletTransactionTableSort } from "./payment-view-data";

const ULID_PATTERN = /^[0-9A-HJKMNP-TV-Z]{26}$/i;

interface WalletTransactionRequestOptions {
  pageSize: number;
  cursor: unknown[] | null;
  direction?: "next" | "previous";
  idSearch: string;
  filters: DataTableFilter[];
  sorts: WalletTransactionTableSort[];
}

export function buildWalletTransactionRequest(
  options: WalletTransactionRequestOptions,
): PageRequestWalletTransactionFilterDtoWalletTransactionSortDto {
  return {
    pageSize: options.pageSize,
    position: buildPosition(options),
    filter: buildWalletTransactionFilter(options.idSearch, options.filters),
    sort: tableSortsToDto(options.sorts.length > 0 ? options.sorts : defaultWalletTransactionSorts),
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

  for (const filter of filters) {
    const nextFilter = toWalletTransactionFilter(filter);

    if (nextFilter) {
      nested.push(nextFilter);
    }
  }

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

function toWalletTransactionFilter(filter: DataTableFilter): WalletTransactionFilterDto | null {
  if (filter.type === "comparison") {
    return toComparisonFilter(filter);
  }

  if (filter.type === "text" && typeof filter.value === "string" && filter.value.trim()) {
    return toTextFilter(filter.filterId, filter.value.trim());
  }

  return null;
}

function toComparisonFilter(filter: DataTableFilter & { type: "comparison" }): WalletTransactionFilterDto | null {
  if (filter.filterId === "minAmount" && typeof filter.value !== "undefined") {
    return {
      amountUsdMicros: {
        operator: ComparisonOperator.GREATER_OR_EQUAL,
        value: dollarsToUsdMicros(Number(filter.value)),
      },
    };
  }

  if (filter.filterId === "maxAmount" && typeof filter.value !== "undefined") {
    return {
      amountUsdMicros: {
        operator: ComparisonOperator.LESS_OR_EQUAL,
        value: dollarsToUsdMicros(Number(filter.value)),
      },
    };
  }

  if (filter.filterId === "createdFrom" && filter.value) {
    return {
      createdAt: {
        operator: ComparisonOperator.GREATER_OR_EQUAL,
        value: `${filter.value}T00:00:00.000Z`,
      },
    };
  }

  if (filter.filterId === "createdTo" && filter.value) {
    return {
      createdAt: {
        operator: ComparisonOperator.LESS_OR_EQUAL,
        value: `${filter.value}T23:59:59.999Z`,
      },
    };
  }

  return null;
}

function toTextFilter(filterId: string, value: string): WalletTransactionFilterDto | null {
  if (filterId === "currency") {
    return {
      currency: {
        operator: TextOperator.CONTAINS,
        value,
      },
    };
  }

  if (filterId === "entryType") {
    return {
      entryType: {
        operator: TextOperator.CONTAINS,
        value,
      },
    };
  }

  if (filterId === "sourceType") {
    return {
      sourceType: {
        operator: TextOperator.CONTAINS,
        value,
      },
    };
  }

  return null;
}
