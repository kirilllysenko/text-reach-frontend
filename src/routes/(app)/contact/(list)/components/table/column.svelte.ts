import type { ContactTableQuery$result } from "$houdini/artifacts/ContactTableQuery";
import { accessorColumn, computedColumn, displayColumn, type ColumnDef } from "$lib/components/table";
import ContactActionCell from "./ContactTableActionCell.svelte";

export type ContactTableRow = ContactTableQuery$result["contacts"]["edges"][number]["node"];

function size(width: number) {
  return {
    maxWidth: Math.max(width * 3, 640),
    minWidth: Math.min(width, 96),
    width,
  };
}

export function createContactColumns(): ColumnDef<ContactTableRow>[] {
  return [
    computedColumn<ContactTableRow, unknown>({
      columnId: "lastName",
      header: "Name",
      getValueFn: (contact) =>
        [contact.firstName, contact.lastName].filter((value) => value).join(" ") || "Unnamed contact",
      options: { filterable: false, sortable: false },
      state: { size: size(220) },
    }),
    accessorColumn<ContactTableRow, "phoneNumber", unknown>({
      accessorKey: "phoneNumber",
      header: "Phone",
      options: { filterable: false, sortable: false },
      state: { size: size(180) },
    }),
    accessorColumn<ContactTableRow, "email", unknown>({
      accessorKey: "email",
      header: "Email",
      options: { filterable: false, sortable: false },
      state: { size: size(240) },
    }),
    accessorColumn<ContactTableRow, "birthday", unknown>({
      accessorKey: "birthday",
      header: "Birthday",
      options: { filterable: false, sortable: false },
      state: { size: size(140) },
    }),
    computedColumn<ContactTableRow, unknown>({
      columnId: "groups",
      header: "Groups",
      getValueFn: (contact) => contact.contactGroups.map((group) => group.id).join(", "),
      options: { filterable: false, sortable: false },
      state: { size: size(260) },
    }),
    accessorColumn<ContactTableRow, "notes", unknown>({
      accessorKey: "notes",
      header: "Notes",
      options: { filterable: false, sortable: false },
      state: { size: size(280) },
    }),
    displayColumn<ContactTableRow, unknown>({
      columnId: "actions",
      header: "",
      cell: ({ row }) => ({
        component: ContactActionCell,
        props: { contact: row.original },
      }),
      options: {
        hideable: false,
        moveable: false,
        pinnable: false,
        resizable: false,
      },
      state: { size: size(88) },
    }),
  ] satisfies ColumnDef<ContactTableRow>[];
}
