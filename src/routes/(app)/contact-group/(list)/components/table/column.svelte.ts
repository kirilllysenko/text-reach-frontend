import { accessorColumn, displayColumn, type ColumnDef } from "$lib/components/table";
import type { ContactGroupViewModel } from "$lib/feature/contact-group/contact-group-view-data";
import ContactGroupActionCell from "../ContactGroupActionCell.svelte";

function size(width: number) {
  return {
    maxWidth: Math.max(width * 3, 640),
    minWidth: Math.min(width, 96),
    width,
  };
}

export function createContactGroupColumns(): ColumnDef<ContactGroupViewModel>[] {
  return [
    accessorColumn<ContactGroupViewModel, "name", unknown>({
      accessorKey: "name",
      header: "Name",
      options: { sortable: true },
      state: { size: size(280) },
    }),
    accessorColumn<ContactGroupViewModel, "contactCount", unknown>({
      accessorKey: "contactCount",
      header: "Contacts",
      options: { sortable: true },
      state: { size: size(140) },
    }),
    accessorColumn<ContactGroupViewModel, "id", unknown>({
      accessorKey: "id",
      header: "ID",
      options: { sortable: false },
      state: { size: size(280) },
    }),
    displayColumn<ContactGroupViewModel, unknown>({
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
  ] satisfies ColumnDef<ContactGroupViewModel>[];
}
