import { accessorColumn, type ColumnDef } from "$lib/components/table";
import type { WalletTransactionViewModel } from "$lib/feature/payment/payment-view-data";

function size(width: number, maxWidth: number) {
  return {
    maxWidth,
    minWidth: Math.min(width, 96),
    width,
  };
}

export function createTransactionColumns(): ColumnDef<WalletTransactionViewModel>[] {
  return [
    accessorColumn<WalletTransactionViewModel, "createdAtDisplay", unknown>({
      accessorKey: "createdAtDisplay",
      columnId: "createdAt",
      header: "Created",
      options: { sortable: true },
      state: { size: size(190, 360) },
    }),
    accessorColumn<WalletTransactionViewModel, "amountDisplay", unknown>({
      accessorKey: "amountDisplay",
      columnId: "amountUsdMicros",
      header: "Amount",
      options: { sortable: true },
      state: { size: size(140, 220) },
    }),
    accessorColumn<WalletTransactionViewModel, "currency", unknown>({
      accessorKey: "currency",
      header: "Currency",
      options: { sortable: true },
      state: { size: size(120, 180) },
    }),
    accessorColumn<WalletTransactionViewModel, "entryTypeLabel", unknown>({
      accessorKey: "entryTypeLabel",
      columnId: "entryType",
      header: "Entry Type",
      options: { sortable: true },
      state: { size: size(150, 260) },
    }),
    accessorColumn<WalletTransactionViewModel, "sourceTypeLabel", unknown>({
      accessorKey: "sourceTypeLabel",
      columnId: "sourceType",
      header: "Source Type",
      options: { sortable: true },
      state: { size: size(150, 260) },
    }),
    accessorColumn<WalletTransactionViewModel, "sourceId", unknown>({
      accessorKey: "sourceId",
      header: "Source ID",
      state: { size: size(280, 520) },
    }),
    accessorColumn<WalletTransactionViewModel, "id", unknown>({
      accessorKey: "id",
      header: "Transaction ID",
      state: { size: size(280, 520) },
    }),
  ] satisfies ColumnDef<WalletTransactionViewModel>[];
}
