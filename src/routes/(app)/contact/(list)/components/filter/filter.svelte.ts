import type { ContactFilterInput } from "$houdini/graphql/inputs";
import { TableBackendFilter } from "$lib/components/table";
import ContactGroupFilterControl from "./ContactGroupFilterControl.svelte";

const contactFilter = new TableBackendFilter<ContactFilterInput>();

export const contactTableFilters = contactFilter.define([
  contactFilter.text({
    filterId: "search",
    fieldId: "filter",
    label: "Search",
    defaultOperator: "CONTAINS",
    backend: { mode: "value" },
    hidden: true,
  }),
  contactFilter.containment({
    filterId: "contactGroup",
    fieldId: "contactGroupId",
    label: "Groups",
    defaultOperator: "IN",
    component: ContactGroupFilterControl,
  }),
  contactFilter.comparison({
    filterId: "birthdayAfter",
    fieldId: "birthday",
    label: "Birthday after",
    defaultOperator: "GREATER_OR_EQUAL",
  }),
  contactFilter.text({
    filterId: "emailContains",
    fieldId: "email",
    label: "Email contains",
    defaultOperator: "CONTAINS",
  }),
]);
