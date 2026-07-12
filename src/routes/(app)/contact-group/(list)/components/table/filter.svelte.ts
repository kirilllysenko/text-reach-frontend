import { comparisonFilter } from "$lib/components/table";

export const contactGroupFilterDefinitions = [
  comparisonFilter({
    filterId: "minContactCount",
    fieldId: "contactCount",
    label: "Min contacts",
    defaultOperator: "GREATER_OR_EQUAL",
  }),
  comparisonFilter({
    filterId: "maxContactCount",
    fieldId: "contactCount",
    label: "Max contacts",
    defaultOperator: "LESS_OR_EQUAL",
  }),
] as const;
