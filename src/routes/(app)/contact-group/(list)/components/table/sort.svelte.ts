import type { ContactGroupSortByInput } from "$houdini/graphql/inputs";
import { sortDefinition, type DataTableSort } from "$lib/components/table";

const definitions = [
  sortDefinition({ sortId: "name", fieldId: "name", label: "Name" }),
  sortDefinition({
    sortId: "contactCount",
    fieldId: "contactCount",
    label: "Contacts",
    defaultDirection: "descending",
  }),
] as const;

export const contactGroupTableSorts = {
  definitions,
  toBackend(sorts: readonly DataTableSort[]): ContactGroupSortByInput[] {
    return sorts.map((sort) => ({
      [toOrderField(sort.sortId)]: {
        direction: sort.direction === "ascending" ? "ASC" : "DESC",
      },
    }));
  },
};

export const contactGroupSortDefinitions = contactGroupTableSorts.definitions;

function toOrderField(sortId: string): keyof ContactGroupSortByInput {
  switch (sortId) {
    case "contactCount":
      return "contactCount";
    case "name":
      return "name";
    default:
      throw new Error(`Unknown contact group sort ${sortId}`);
  }
}
