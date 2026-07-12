import { sortDefinition } from "$lib/components/table";

export const contactGroupSortDefinitions = [
  sortDefinition({ sortId: "name", fieldId: "name", label: "Name" }),
  sortDefinition({
    sortId: "contactCount",
    fieldId: "contactCount",
    label: "Contacts",
    defaultDirection: "descending",
  }),
] as const;
