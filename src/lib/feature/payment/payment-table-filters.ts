import type { WalletTransactionFilterInput } from "$houdini/graphql/inputs";
import { backendFilterDefinition } from "$lib/components/table";
import { dollarsToUsdMicros, usdMicrosToDollars } from "$lib/feature/payment/payment-display";

const paymentFilter = backendFilterDefinition<WalletTransactionFilterInput>();

export const walletTransactionFilterDefinitions = [
  paymentFilter.comparison({
    filterId: "minAmount",
    field: "amountUsdMicros",
    label: "Min amount",
    defaultOperator: "GREATER_OR_EQUAL",
    value: {
      fromBackend: usdMicrosToDollars,
      toBackend: (value) => dollarsToUsdMicros(Number(value)),
    },
  }),
  paymentFilter.comparison({
    filterId: "maxAmount",
    field: "amountUsdMicros",
    label: "Max amount",
    defaultOperator: "LESS_OR_EQUAL",
    value: {
      fromBackend: usdMicrosToDollars,
      toBackend: (value) => dollarsToUsdMicros(Number(value)),
    },
  }),
  paymentFilter.comparison({
    filterId: "createdFrom",
    field: "createdAt",
    label: "Created from",
    defaultOperator: "GREATER_OR_EQUAL",
    value: {
      fromBackend: toDateInputValue,
      toBackend: (value) => `${value}T00:00:00.000Z`,
    },
  }),
  paymentFilter.comparison({
    filterId: "createdTo",
    field: "createdAt",
    label: "Created to",
    defaultOperator: "LESS_OR_EQUAL",
    value: {
      fromBackend: toDateInputValue,
      toBackend: (value) => `${value}T23:59:59.999Z`,
    },
  }),
  paymentFilter.text({ filterId: "currency", field: "currency", label: "Currency", defaultOperator: "CONTAINS" }),
  paymentFilter.text({
    filterId: "entryType",
    field: "entryType",
    label: "Entry type",
    defaultOperator: "CONTAINS",
  }),
  paymentFilter.text({
    filterId: "sourceType",
    field: "sourceType",
    label: "Source type",
    defaultOperator: "CONTAINS",
  }),
] as const;

function toDateInputValue(value: string): string {
  return value.slice(0, 10);
}
