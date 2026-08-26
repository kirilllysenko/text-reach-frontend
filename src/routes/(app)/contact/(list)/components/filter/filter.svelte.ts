import type { ContactFilterInput } from "$houdini/graphql/inputs";
import { backendFilterDefinition } from "text-reach-frontend-library/components/table";
import ContactGroupFilterControl from "./ContactGroupFilterControl.svelte";

const contactFilter = backendFilterDefinition<ContactFilterInput>();

export const contactFilterDefinitions = [
  contactFilter.value({
    filterId: "search",
    field: "filter",
    label: "Search",
    defaultOperator: "CONTAINS",
    hidden: true,
  }),
  contactFilter.containment({
    filterId: "contactGroup",
    field: "contactGroupId",
    label: "Groups",
    defaultOperator: "IN",
    component: ContactGroupFilterControl,
  }),
  contactFilter.comparison({
    filterId: "birthdayAfter",
    field: "birthday",
    label: "Birthday after",
    defaultOperator: "GREATER_OR_EQUAL",
  }),
  contactFilter.text({
    filterId: "emailContains",
    field: "email",
    label: "Email contains",
    defaultOperator: "CONTAINS",
  }),
] as const;
