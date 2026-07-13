import type { ContactGroupSortDto } from "$lib/api/index.schemas";
import { TableBackendSort } from "$lib/components/table";

const contactGroupSort = new TableBackendSort<ContactGroupSortDto>();

export const contactGroupTableSorts = contactGroupSort.define([
  contactGroupSort.sort({ sortId: "name", fieldId: "name", label: "Name" }),
  contactGroupSort.sort({
    sortId: "contactCount",
    fieldId: "contactCount",
    label: "Contacts",
    defaultDirection: "descending",
  }),
] as const);

export const contactGroupSortDefinitions = contactGroupTableSorts.definitions;
