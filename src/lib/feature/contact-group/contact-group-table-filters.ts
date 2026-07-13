import type { ContactGroupFilterDto } from "$lib/api/index.schemas";
import { TableBackendFilter } from "$lib/components/table";

const contactGroupFilter = new TableBackendFilter<ContactGroupFilterDto>();

export const contactGroupTableFilters = contactGroupFilter.define([
  contactGroupFilter.comparison({
    filterId: "minContactCount",
    fieldId: "contactCount",
    label: "Min contacts",
    defaultOperator: "GREATER_OR_EQUAL",
    backend: { mapValue: toContactCount },
  }),
  contactGroupFilter.comparison({
    filterId: "maxContactCount",
    fieldId: "contactCount",
    label: "Max contacts",
    defaultOperator: "LESS_OR_EQUAL",
    backend: { mapValue: toContactCount },
  }),
] as const);

function toContactCount(value: string | number): number | undefined {
  const count = Number(value);
  return Number.isNaN(count) ? undefined : count;
}
