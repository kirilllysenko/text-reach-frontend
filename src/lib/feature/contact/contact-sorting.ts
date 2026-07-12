import type { ContactSortDto } from "$lib/api/index.schemas";
import { sortDefinition, type DataTableSortDefinition, type DataTableSortFromDefinitions } from "$lib/components/table";
import type { SortDtoField } from "$lib/utils/table-sort";

export const contactSortDefinitions = [
  sortDefinition({ sortId: "lastName", label: "Last name" }),
  sortDefinition({ sortId: "firstName", label: "First name" }),
  sortDefinition({ sortId: "phoneNumber", label: "Phone" }),
  sortDefinition({ sortId: "email", label: "Email" }),
  sortDefinition({ sortId: "birthday", label: "Birthday" }),
] as const satisfies readonly DataTableSortDefinition<SortDtoField<ContactSortDto>>[];

export type ContactTableSort = DataTableSortFromDefinitions<typeof contactSortDefinitions>;

export const defaultContactSorts = [
  {
    sortId: contactSortDefinitions[0].sortId,
    direction: contactSortDefinitions[0].defaultDirection,
  },
  {
    sortId: contactSortDefinitions[1].sortId,
    direction: contactSortDefinitions[1].defaultDirection,
  },
] satisfies ContactTableSort[];
