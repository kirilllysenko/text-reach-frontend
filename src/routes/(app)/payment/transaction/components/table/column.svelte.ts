import type { WalletTransactions$result } from "$houdini/artifacts/WalletTransactions";
import { accessorColumn, computedColumn, type ColumnDef } from "text-reach-frontend-library/components/table";
import { formatPaymentDate, formatPaymentType, formatUsdMicros } from "$lib/feature/payment/payment-display";

export type WalletTransactionTableRow = WalletTransactions$result["walletTransactions"]["edges"][number]["node"];

function size(width: number, maxWidth: number) {
  return {
    maxWidth,
    minWidth: Math.min(width, 96),
    width,
  };
}

export function createTransactionColumns(): ColumnDef<WalletTransactionTableRow>[] {
  return [
    computedColumn<WalletTransactionTableRow, unknown>({
      columnId: "createdAt",
      getValueFn: (transaction) => formatPaymentDate(transaction.createdAt),
      header: "Created",
      options: { sortable: true },
      state: { size: size(190, 360) },
    }),
    computedColumn<WalletTransactionTableRow, unknown>({
      columnId: "amountUsdMicros",
      getValueFn: (transaction) => formatUsdMicros(transaction.amountUsdMicros),
      header: "Amount",
      options: { sortable: true },
      state: { size: size(140, 220) },
    }),
    accessorColumn<WalletTransactionTableRow, "currency", unknown>({
      accessorKey: "currency",
      header: "Currency",
      options: { sortable: true },
      state: { size: size(120, 180) },
    }),
    computedColumn<WalletTransactionTableRow, unknown>({
      columnId: "entryType",
      getValueFn: (transaction) => formatPaymentType(transaction.entryType),
      header: "Entry Type",
      options: { sortable: true },
      state: { size: size(150, 260) },
    }),
    computedColumn<WalletTransactionTableRow, unknown>({
      columnId: "sourceType",
      getValueFn: (transaction) => (transaction.source ? formatPaymentType(transaction.source.__typename) : "—"),
      header: "Source Type",
      options: { sortable: true },
      state: { size: size(150, 260) },
    }),
    computedColumn<WalletTransactionTableRow, unknown>({
      columnId: "sourceId",
      getValueFn: (transaction) => transaction.source?.id ?? "—",
      header: "Source ID",
      state: { size: size(280, 520) },
    }),
    accessorColumn<WalletTransactionTableRow, "id", unknown>({
      accessorKey: "id",
      header: "Transaction ID",
      state: { size: size(280, 520) },
    }),
  ] satisfies ColumnDef<WalletTransactionTableRow>[];
}
