import { accessorColumn, displayColumn, type ColumnDef } from "$lib/components/table";
import type { UserViewModel } from "$lib/feature/user/user-view-data";
import UserActionCell from "../UserActionCell.svelte";

function size(width: number) {
  return {
    maxWidth: Math.max(width * 3, 640),
    minWidth: Math.min(width, 96),
    width,
  };
}

interface UserColumnOptions {
  onDelete: (user: UserViewModel) => Promise<boolean>;
}

export function createUserColumns(options: UserColumnOptions): ColumnDef<UserViewModel>[] {
  return [
    accessorColumn<UserViewModel, "name", unknown>({
      accessorKey: "name",
      header: "Name",
      options: { sortable: true },
      state: { size: size(240) },
    }),
    accessorColumn<UserViewModel, "email", unknown>({
      accessorKey: "email",
      header: "Email",
      options: { sortable: true },
      state: { size: size(300) },
    }),
    accessorColumn<UserViewModel, "roleLabel", unknown>({
      accessorKey: "roleLabel",
      columnId: "role",
      header: "Role",
      options: { sortable: true },
      state: { size: size(160) },
    }),
    accessorColumn<UserViewModel, "id", unknown>({
      accessorKey: "id",
      header: "ID",
      options: { searchable: false, sortable: false },
      state: { size: size(280) },
    }),
    displayColumn<UserViewModel, unknown>({
      columnId: "actions",
      header: "",
      cell: ({ row }) => ({
        component: UserActionCell,
        props: { onDelete: options.onDelete, user: row.original },
      }),
      options: {
        hideable: false,
        moveable: false,
        pinnable: false,
        resizable: false,
        searchable: false,
      },
      state: { size: { maxWidth: 180, minWidth: 144, width: 144 } },
    }),
  ] satisfies ColumnDef<UserViewModel>[];
}
