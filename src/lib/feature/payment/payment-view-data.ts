import { SortDirection, type SortDirection as SortDirectionValue } from "$lib/api/index.schemas";

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

export type WalletTransactionSortField = "amountUsdMicros" | "createdAt" | "currency" | "entryType" | "sourceType";

export interface WalletTransactionSortRule {
  id: string;
  field: WalletTransactionSortField;
  direction: SortDirectionValue;
}

export const walletTransactionSortFieldOptions: WalletTransactionSortField[] = [
  "createdAt",
  "amountUsdMicros",
  "currency",
  "entryType",
  "sourceType",
];

export const walletTransactionSortFieldLabelMap: Record<WalletTransactionSortField, string> = {
  amountUsdMicros: "Amount",
  createdAt: "Created",
  currency: "Currency",
  entryType: "Entry Type",
  sourceType: "Source Type",
};

export const defaultWalletTransactionSortRules: WalletTransactionSortRule[] = [
  {
    id: "createdAt",
    field: "createdAt",
    direction: SortDirection.DESC,
  },
];
