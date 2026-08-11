import type { ContactSortByInput } from "$houdini/graphql/inputs";
import { backendSortDefinition } from "$lib";

const contactSort = backendSortDefinition<ContactSortByInput>();

export const contactSortDefinitions = [
  contactSort({ field: "lastName", label: "Last name" }),
  contactSort({ field: "firstName", label: "First name" }),
  contactSort({ field: "phoneNumber", label: "Phone" }),
  contactSort({ field: "email", label: "Email" }),
  contactSort({ field: "birthday", label: "Birthday" }),
] as const;

export const initialContactSorts = [
  { lastName: { direction: "ASC" } },
  { firstName: { direction: "ASC" } },
] satisfies ContactSortByInput[];
