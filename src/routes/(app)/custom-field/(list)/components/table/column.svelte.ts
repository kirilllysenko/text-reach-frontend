import { accessorColumn, displayColumn, type ColumnDef } from "$lib/components/table";
import type { CustomFieldViewModel } from "$lib/feature/custom-field/custom-field-view-data";
import CustomFieldActionCell from "../CustomFieldActionCell.svelte";

function size(width: number, maxWidth: number) {
  return {
    maxWidth,
    minWidth: Math.min(width, 96),
    width,
  };
}

export function createCustomFieldColumns(): ColumnDef<CustomFieldViewModel>[] {
  return [
    accessorColumn<CustomFieldViewModel, "name", unknown>({
      accessorKey: "name",
      header: "Name",
      options: { sortable: true },
      state: { size: size(280, 1200) },
    }),
    accessorColumn<CustomFieldViewModel, "typeLabel", unknown>({
      accessorKey: "typeLabel",
      columnId: "type",
      header: "Type",
      options: { sortable: true },
      state: { size: size(160, 320) },
    }),
    displayColumn<CustomFieldViewModel, unknown>({
      columnId: "actions",
      header: "",
      cell: ({ row }) => ({
        component: CustomFieldActionCell,
        props: { field: row.original },
      }),
      options: {
        hideable: false,
        moveable: false,
        pinnable: false,
        resizable: false,
      },
      state: { size: size(88, 120) },
    }),
  ] satisfies ColumnDef<CustomFieldViewModel>[];
}
