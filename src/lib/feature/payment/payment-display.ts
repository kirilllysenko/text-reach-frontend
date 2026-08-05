import type { WalletTransactionViewModel } from "./payment-view-data";

export interface WalletBalanceData {
  balanceUsdMicros: number;
  currency: string;
}

interface WalletTransactionData {
  amountUsdMicros: number;
  createdAt: string;
  currency: string;
  entryType: string;
  id: string;
  source: { __typename: string; id: string };
}

const USD_MICROS_PER_DOLLAR = 1_000_000;

const usdFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  style: "currency",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function usdMicrosToDollars(value: number): number {
  return value / USD_MICROS_PER_DOLLAR;
}

export function dollarsToUsdMicros(value: number): number {
  return Math.round(value * USD_MICROS_PER_DOLLAR);
}

export function formatUsdMicros(value: number): string {
  return usdFormatter.format(usdMicrosToDollars(value));
}

export function formatPaymentBalance(balance: WalletBalanceData | null): string {
  return formatUsdMicros(balance?.balanceUsdMicros ?? 0);
}

export function formatPaymentDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return dateTimeFormatter.format(date);
}

export function formatPaymentType(value: string): string {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function toWalletTransactionViewModel(transaction: WalletTransactionData): WalletTransactionViewModel {
  return {
    id: transaction.id,
    amountDisplay: formatUsdMicros(transaction.amountUsdMicros),
    amountUsdMicros: transaction.amountUsdMicros,
    createdAt: transaction.createdAt,
    createdAtDisplay: formatPaymentDate(transaction.createdAt),
    currency: transaction.currency,
    entryType: transaction.entryType,
    entryTypeLabel: formatPaymentType(transaction.entryType),
    sourceId: transaction.source.id,
    sourceType: transaction.source.__typename,
    sourceTypeLabel: formatPaymentType(transaction.source.__typename),
  };
}
