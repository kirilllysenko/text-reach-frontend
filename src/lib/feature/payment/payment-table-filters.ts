import type { WalletTransactionFilterDto } from "$lib/api/index.schemas";
import { TableBackendFilter } from "$lib/components/table";
import { dollarsToUsdMicros } from "$lib/feature/payment/payment-display";

const paymentFilter = new TableBackendFilter<WalletTransactionFilterDto>();

export const walletTransactionTableFilters = paymentFilter.define([
  paymentFilter.comparison({
    filterId: "minAmount",
    fieldId: "amountUsdMicros",
    label: "Min amount",
    defaultOperator: "GREATER_OR_EQUAL",
    backend: { mapValue: (value) => dollarsToUsdMicros(Number(value)) },
  }),
  paymentFilter.comparison({
    filterId: "maxAmount",
    fieldId: "amountUsdMicros",
    label: "Max amount",
    defaultOperator: "LESS_OR_EQUAL",
    backend: { mapValue: (value) => dollarsToUsdMicros(Number(value)) },
  }),
  paymentFilter.comparison({
    filterId: "createdFrom",
    fieldId: "createdAt",
    label: "Created from",
    defaultOperator: "GREATER_OR_EQUAL",
    backend: { mapValue: (value) => `${value}T00:00:00.000Z` },
  }),
  paymentFilter.comparison({
    filterId: "createdTo",
    fieldId: "createdAt",
    label: "Created to",
    defaultOperator: "LESS_OR_EQUAL",
    backend: { mapValue: (value) => `${value}T23:59:59.999Z` },
  }),
  paymentFilter.text({ filterId: "currency", fieldId: "currency", label: "Currency", defaultOperator: "CONTAINS" }),
  paymentFilter.text({
    filterId: "entryType",
    fieldId: "entryType",
    label: "Entry type",
    defaultOperator: "CONTAINS",
  }),
  paymentFilter.text({
    filterId: "sourceType",
    fieldId: "sourceType",
    label: "Source type",
    defaultOperator: "CONTAINS",
  }),
] as const);
