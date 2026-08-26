export interface WalletBalanceData {
  balanceUsdMicros: number;
  currency: string;
}

const usdMicrosPerDollar = 1_000_000;
const usdFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  style: "currency",
});

export function usdMicrosToDollars(value: number): number {
  return value / usdMicrosPerDollar;
}

export function dollarsToUsdMicros(value: number): number {
  return Math.round(value * usdMicrosPerDollar);
}

export function formatUsdMicros(value: number): string {
  return usdFormatter.format(usdMicrosToDollars(value));
}

export function formatPaymentBalance(balance: WalletBalanceData | null): string {
  return formatUsdMicros(balance?.balanceUsdMicros ?? 0);
}

export function formatPaymentDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function formatPaymentType(value: string): string {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}
