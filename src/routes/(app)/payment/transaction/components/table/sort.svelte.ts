import type { WalletTransactionSortDto } from "$lib/api/index.schemas";
import { TableBackendSort } from "$lib/components/table";

const transactionSort = new TableBackendSort<WalletTransactionSortDto>();

export const transactionTableSorts = transactionSort.define([
  transactionSort.sort({
    sortId: "createdAt",
    fieldId: "createdAt",
    label: "Created",
    defaultDirection: "descending",
  }),
  transactionSort.sort({ sortId: "amountUsdMicros", fieldId: "amountUsdMicros", label: "Amount" }),
  transactionSort.sort({ sortId: "currency", fieldId: "currency", label: "Currency" }),
  transactionSort.sort({ sortId: "entryType", fieldId: "entryType", label: "Entry Type" }),
  transactionSort.sort({ sortId: "sourceType", fieldId: "sourceType", label: "Source Type" }),
] as const);

export const transactionSortDefinitions = transactionTableSorts.definitions;
