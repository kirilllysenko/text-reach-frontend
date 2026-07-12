import type { ContactGroupSortDto } from "$lib/api/index.schemas";
import { sortDefinition, type DataTableSortDefinition, type DataTableSortFromDefinitions } from "$lib/components/table";
import type { SortDtoField } from "$lib/utils/table-sort";

export const contactGroupSortDefinitions = [
  sortDefinition({ sortId: "name", label: "Name" }),
  sortDefinition({
    sortId: "contactCount",
    label: "Contacts",
    defaultDirection: "descending",
  }),
] as const satisfies readonly DataTableSortDefinition<SortDtoField<ContactGroupSortDto>>[];

export type ContactGroupTableSort = DataTableSortFromDefinitions<typeof contactGroupSortDefinitions>;

export const defaultContactGroupSorts = [
  {
    sortId: contactGroupSortDefinitions[0].sortId,
    direction: contactGroupSortDefinitions[0].defaultDirection,
  },
] satisfies ContactGroupTableSort[];
