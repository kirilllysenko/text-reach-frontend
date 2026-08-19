import type { WalletTransactionSortByInput } from "$houdini/graphql/inputs";
import { backendSortDefinition } from "text-reach-frontend-library/components/table";

const transactionSort = backendSortDefinition<WalletTransactionSortByInput>();

export const transactionSortDefinitions = [
  transactionSort({ field: "createdAt", label: "Created", defaultDirection: "DESC" }),
  transactionSort({ field: "amountUsdMicros", label: "Amount" }),
  transactionSort({ field: "currency", label: "Currency" }),
  transactionSort({ field: "entryType", label: "Entry Type" }),
  transactionSort({ field: "sourceType", label: "Source Type" }),
] as const;

export const initialTransactionSorts = [{ createdAt: { direction: "DESC" } }] satisfies WalletTransactionSortByInput[];
