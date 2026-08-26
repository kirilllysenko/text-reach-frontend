import type { CustomFields$result } from "$houdini/artifacts/CustomFields";
import {
  accessorColumn,
  computedColumn,
  displayColumn,
  type ColumnDef,
} from "text-reach-frontend-library/components/table";
import { customFieldTypeLabelMap } from "$lib/feature/custom-field/custom-field-view-data";
import CustomFieldActionCell from "./CustomFieldActionCell.svelte";

export type CustomFieldTableRow = CustomFields$result["customFields"][number];

function size(width: number, maxWidth: number) {
  return {
    maxWidth,
    minWidth: Math.min(width, 96),
    width,
  };
}

export function createCustomFieldColumns(): ColumnDef<CustomFieldTableRow>[] {
  return [
    accessorColumn<CustomFieldTableRow, "name", unknown>({
      accessorKey: "name",
      header: "Name",
      options: { sortable: true },
      state: { size: size(280, 1200) },
    }),
    computedColumn<CustomFieldTableRow, unknown>({
      columnId: "type",
      header: "Type",
      getValueFn: (field) => customFieldTypeLabelMap[field.fieldType],
      options: { sortable: true },
      state: { size: size(160, 320) },
    }),
    displayColumn<CustomFieldTableRow, unknown>({
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
  ] satisfies ColumnDef<CustomFieldTableRow>[];
}
