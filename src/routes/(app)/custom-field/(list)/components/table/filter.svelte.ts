import { containmentFilter } from "$lib/components/table";

export const customFieldFilterDefinitions = [
  containmentFilter({
    filterId: "type",
    fieldId: "type",
    label: "Type",
    defaultOperator: "IN",
  }),
] as const;
