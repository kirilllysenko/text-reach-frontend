import { sortDefinition } from "$lib/components/table";

export const customFieldSortDefinitions = [
  sortDefinition({ sortId: "name", fieldId: "name", label: "Name" }),
  sortDefinition({ sortId: "type", fieldId: "type", label: "Type" }),
] as const;
