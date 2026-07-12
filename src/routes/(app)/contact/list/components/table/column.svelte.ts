import { accessorColumn, computedColumn, displayColumn, type ColumnDef } from "$lib/components/table";
import type { ContactViewModel } from "$lib/feature/contact/contact-view-data";
import ContactActionCell from "./ContactTableActionCell.svelte";

function size(width: number) {
  return {
    maxWidth: Math.max(width * 3, 640),
    minWidth: Math.min(width, 96),
    width,
  };
}

export function createContactColumns(): ColumnDef<ContactViewModel>[] {
  return [
    accessorColumn<ContactViewModel, "fullName", unknown>({
      accessorKey: "fullName",
      columnId: "lastName",
      header: "Name",
      options: { filterable: false, sortable: false },
      state: { size: size(220) },
    }),
    accessorColumn<ContactViewModel, "phoneNumber", unknown>({
      accessorKey: "phoneNumber",
      header: "Phone",
      options: { filterable: false, sortable: false },
      state: { size: size(180) },
    }),
    accessorColumn<ContactViewModel, "email", unknown>({
      accessorKey: "email",
      header: "Email",
      options: { filterable: false, sortable: false },
      state: { size: size(240) },
    }),
    accessorColumn<ContactViewModel, "birthday", unknown>({
      accessorKey: "birthday",
      header: "Birthday",
      options: { filterable: false, sortable: false },
      state: { size: size(140) },
    }),
    computedColumn<ContactViewModel, unknown>({
      columnId: "groups",
      header: "Groups",
      getValueFn: (contact) => contact.contactGroupIds.join(", "),
      options: { filterable: false, sortable: false },
      state: { size: size(260) },
    }),
    accessorColumn<ContactViewModel, "notes", unknown>({
      accessorKey: "notes",
      header: "Notes",
      options: { filterable: false, sortable: false },
      state: { size: size(280) },
    }),
    displayColumn<ContactViewModel, unknown>({
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
  ] satisfies ColumnDef<ContactViewModel>[];
}
