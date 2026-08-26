import type { ContactGroups$result } from "$houdini/artifacts/ContactGroups";
import { accessorColumn, displayColumn, type ColumnDef } from "text-reach-frontend-library/components/table";
import ContactGroupActionCell from "./ContactGroupActionCell.svelte";

export type ContactGroupTableRow = ContactGroups$result["contactGroups"]["edges"][number]["node"];

function size(width: number) {
  return {
    maxWidth: Math.max(width * 3, 640),
    minWidth: Math.min(width, 96),
    width,
  };
}

export function createContactGroupColumns(): ColumnDef<ContactGroupTableRow>[] {
  return [
    accessorColumn<ContactGroupTableRow, "name", unknown>({
      accessorKey: "name",
      header: "Name",
      options: { sortable: true },
      state: { size: size(280) },
    }),
    accessorColumn<ContactGroupTableRow, "contactCount", unknown>({
      accessorKey: "contactCount",
      header: "Contacts",
      options: { sortable: true },
      state: { size: size(140) },
    }),
    accessorColumn<ContactGroupTableRow, "id", unknown>({
      accessorKey: "id",
      header: "ID",
      options: { sortable: false },
      state: { size: size(280) },
    }),
    displayColumn<ContactGroupTableRow, unknown>({
      columnId: "actions",
      header: "",
      cell: ({ row }) => ({
        component: ContactGroupActionCell,
        props: { contactGroup: row.original },
      }),
      options: {
        hideable: false,
        moveable: false,
        pinnable: false,
        resizable: false,
      },
      state: {
        size: {
          maxWidth: 120,
          minWidth: 88,
          width: 88,
        },
      },
    }),
  ] satisfies ColumnDef<ContactGroupTableRow>[];
}
