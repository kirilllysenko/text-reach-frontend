export interface WalletBalanceData {
  balanceUsdMicros: number;
  currency: string;
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
