import type { Users$result } from "$houdini/artifacts/Users";
import { accessorColumn, computedColumn, displayColumn, type ColumnDef } from "text-reach-frontend-library/components/table";
import { userRoleLabelMap } from "$lib/feature/user/user-view-data";
import UserActionCell from "./UserActionCell.svelte";

export type UserTableRow = Users$result["users"]["edges"][number]["node"];

function size(width: number) {
  return {
    maxWidth: Math.max(width * 3, 640),
    minWidth: Math.min(width, 96),
    width,
  };
}

interface UserColumnOptions {
  onDeleted: () => Promise<unknown>;
}

export function createUserColumns(options: UserColumnOptions): ColumnDef<UserTableRow>[] {
  return [
    computedColumn<UserTableRow, unknown>({
      columnId: "name",
      getValueFn: (user) => user.name?.trim() || "Unnamed user",
      header: "Name",
      options: { sortable: true },
      state: { size: size(240) },
    }),
    accessorColumn<UserTableRow, "email", unknown>({
      accessorKey: "email",
      header: "Email",
      options: { sortable: true },
      state: { size: size(300) },
    }),
    computedColumn<UserTableRow, unknown>({
      columnId: "role",
      getValueFn: (user) => userRoleLabelMap[user.role],
      header: "Role",
      options: { sortable: true },
      state: { size: size(160) },
    }),
    accessorColumn<UserTableRow, "id", unknown>({
      accessorKey: "id",
      header: "ID",
      options: { searchable: false, sortable: false },
      state: { size: size(280) },
    }),
    displayColumn<UserTableRow, unknown>({
      columnId: "actions",
      header: "",
      cell: ({ row }) => ({
        component: UserActionCell,
        props: { onDeleted: options.onDeleted, user: row.original },
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
  ] satisfies ColumnDef<UserTableRow>[];
}
