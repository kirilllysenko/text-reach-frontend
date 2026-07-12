import type { WalletTransactionSortDto } from "$lib/api/index.schemas";
import { sortDefinition, type DataTableSortDefinition, type DataTableSortFromDefinitions } from "$lib/components/table";
import type { SortDtoField } from "$lib/utils/table-sort";

export interface WalletTransactionViewModel {
  id: string;
  amountDisplay: string;
  amountUsdMicros: number;
  createdAt: string;
  createdAtDisplay: string;
  currency: string;
  entryType: string;
  entryTypeLabel: string;
  sourceId: string;
  sourceType: string;
  sourceTypeLabel: string;
}

export const walletTransactionSortDefinitions = [
  sortDefinition({ sortId: "createdAt", label: "Created", defaultDirection: "descending" }),
  sortDefinition({ sortId: "amountUsdMicros", label: "Amount" }),
  sortDefinition({ sortId: "currency", label: "Currency" }),
  sortDefinition({ sortId: "entryType", label: "Entry Type" }),
  sortDefinition({ sortId: "sourceType", label: "Source Type" }),
] as const satisfies readonly DataTableSortDefinition<SortDtoField<WalletTransactionSortDto>>[];

export type WalletTransactionTableSort = DataTableSortFromDefinitions<typeof walletTransactionSortDefinitions>;

export const defaultWalletTransactionSorts = [
  {
    direction: walletTransactionSortDefinitions[0].defaultDirection,
    sortId: walletTransactionSortDefinitions[0].sortId,
  },
] satisfies WalletTransactionTableSort[];
