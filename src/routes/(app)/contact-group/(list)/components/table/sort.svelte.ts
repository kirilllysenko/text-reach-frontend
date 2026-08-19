import type { ContactGroupSortByInput } from "$houdini/graphql/inputs";
import { backendSortDefinition } from "text-reach-frontend-library/components/table";

const contactGroupSort = backendSortDefinition<ContactGroupSortByInput>();

export const contactGroupSortDefinitions = [
  contactGroupSort({ field: "name", label: "Name" }),
  contactGroupSort({ field: "contactCount", label: "Contacts", defaultDirection: "DESC" }),
] as const;

export const initialContactGroupSorts = [{ name: { direction: "ASC" } }] satisfies ContactGroupSortByInput[];
