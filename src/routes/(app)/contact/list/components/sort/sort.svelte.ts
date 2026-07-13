import type { ContactSortDto } from "$lib/api/index.schemas";
import { TableBackendSort } from "$lib/components/table";

const contactSort = new TableBackendSort<ContactSortDto>();

export const contactTableSorts = contactSort.define([
  contactSort.sort({ sortId: "lastName", fieldId: "lastName", label: "Last name" }),
  contactSort.sort({ sortId: "firstName", fieldId: "firstName", label: "First name" }),
  contactSort.sort({ sortId: "phoneNumber", fieldId: "phoneNumber", label: "Phone" }),
  contactSort.sort({ sortId: "email", fieldId: "email", label: "Email" }),
  contactSort.sort({ sortId: "birthday", fieldId: "birthday", label: "Birthday" }),
] as const);

export const contactSortDefinitions = contactTableSorts.definitions;
