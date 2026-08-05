import type { WalletTransactionSortByInput } from "$houdini/graphql/inputs";
import { sortDefinition, type DataTableSort } from "$lib/components/table";

const definitions = [
  sortDefinition({
    sortId: "createdAt",
    fieldId: "createdAt",
    label: "Created",
    defaultDirection: "descending",
  }),
  sortDefinition({ sortId: "amountUsdMicros", fieldId: "amountUsdMicros", label: "Amount" }),
  sortDefinition({ sortId: "currency", fieldId: "currency", label: "Currency" }),
  sortDefinition({ sortId: "entryType", fieldId: "entryType", label: "Entry Type" }),
  sortDefinition({ sortId: "sourceType", fieldId: "sourceType", label: "Source Type" }),
] as const;

export const transactionTableSorts = {
  definitions,
  toBackend(sorts: readonly DataTableSort[]): WalletTransactionSortByInput[] {
    return sorts.map((sort) => ({
      [sort.sortId]: { direction: sort.direction === "ascending" ? "ASC" : "DESC" },
    }));
  },
};

export const transactionSortDefinitions = definitions;
