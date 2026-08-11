import type { ContactGroupFilterInput } from "$houdini/graphql/inputs";
import { backendFilterDefinition } from "$lib/components/table";

const contactGroupFilter = backendFilterDefinition<ContactGroupFilterInput>();

export const contactGroupFilterDefinitions = [
  contactGroupFilter.comparison({
    filterId: "minContactCount",
    field: "contactCount",
    label: "Min contacts",
    defaultOperator: "GREATER_OR_EQUAL",
    value: { toBackend: toContactCount },
  }),
  contactGroupFilter.comparison({
    filterId: "maxContactCount",
    field: "contactCount",
    label: "Max contacts",
    defaultOperator: "LESS_OR_EQUAL",
    value: { toBackend: toContactCount },
  }),
] as const;

function toContactCount(value: string | number): number | undefined {
  const count = Number(value);
  return Number.isNaN(count) ? undefined : count;
}
