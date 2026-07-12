import { SortDirection } from "$lib/api/index.schemas";
import { sortDefinition, type DataTableSort, type DataTableSortFromDefinitions } from "$lib/components/table";
import {
  contactSortFieldOptions,
  type ContactSortField,
  type ContactSortRule,
} from "$lib/feature/contact/contact-view-data";

export const contactSortDefinitions = [
  sortDefinition({ sortId: "lastName", fieldId: "lastName", label: "Last name" }),
  sortDefinition({ sortId: "firstName", fieldId: "firstName", label: "First name" }),
  sortDefinition({ sortId: "phoneNumber", fieldId: "phoneNumber", label: "Phone" }),
  sortDefinition({ sortId: "email", fieldId: "email", label: "Email" }),
  sortDefinition({ sortId: "birthday", fieldId: "birthday", label: "Birthday" }),
] as const;

export type ContactTableSort = DataTableSortFromDefinitions<typeof contactSortDefinitions>;

export function getContactSortRules(sorting: DataTableSort[]): ContactSortRule[] {
  const sortableFields = new Set<ContactSortField>(contactSortFieldOptions);

  return sorting
    .filter((sort): sort is DataTableSort & { sortId: ContactSortField } =>
      sortableFields.has(sort.sortId as ContactSortField),
    )
    .map((sort) => ({
      id: sort.sortId,
      field: sort.sortId,
      direction: sort.direction === "ascending" ? SortDirection.ASC : SortDirection.DESC,
    }));
}
