import { sortDefinition } from "text-reach-frontend-library/components/table";
import { customFieldTypeLabelMap } from "$lib/feature/custom-field/custom-field-view-data";
import type { CustomFieldTableRow } from "../table/column.svelte";

export const customFieldSortDefinitions = [
  sortDefinition<"name", CustomFieldTableRow>({ sortId: "name", fieldId: "name", label: "Name" }),
  sortDefinition<"type", CustomFieldTableRow>({
    sortId: "type",
    getValueFn: (field) => customFieldTypeLabelMap[field.fieldType],
    label: "Type",
  }),
] as const;
