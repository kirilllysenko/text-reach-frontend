import type { ContactSortByInput } from "$houdini/graphql/inputs";
import { sortDefinition, type DataTableSort } from "$lib/components/table";

const definitions = [
  sortDefinition({ sortId: "lastName", fieldId: "lastName", label: "Last name" }),
  sortDefinition({ sortId: "firstName", fieldId: "firstName", label: "First name" }),
  sortDefinition({ sortId: "phoneNumber", fieldId: "phoneNumber", label: "Phone" }),
  sortDefinition({ sortId: "email", fieldId: "email", label: "Email" }),
  sortDefinition({ sortId: "birthday", fieldId: "birthday", label: "Birthday" }),
] as const;

export const contactTableSorts = {
  definitions,
  toBackend(sorts: readonly DataTableSort[]): ContactSortByInput[] {
    return sorts.map((sort) => ({
      [sort.sortId]: { direction: sort.direction === "ascending" ? "ASC" : "DESC" },
    }));
  },
};

export const contactSortDefinitions = definitions;
