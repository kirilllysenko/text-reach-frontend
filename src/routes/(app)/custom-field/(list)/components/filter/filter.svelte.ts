import { containmentFilter } from "text-reach-frontend-library/components/table";
import type { CustomFieldTableRow } from "../table/column.svelte";

export const customFieldFilterDefinitions = [
  containmentFilter<"type", CustomFieldTableRow>({
    filterId: "type",
    getValueFn: (field) => field.fieldType,
    label: "Type",
    defaultOperator: "IN",
  }),
] as const;
