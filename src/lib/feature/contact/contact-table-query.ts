import { SortDirection } from "$lib/api/index.schemas";
import type { DataTableFilter, DataTableSort } from "$lib/components/table";
import {
  contactSortFieldOptions,
  type ContactSortField,
  type ContactSortRule,
} from "$lib/feature/contact/contact-view-data";

export interface ContactTableFilters {
  birthdayAfter: string;
  contactGroupIds: string[];
  emailContains: string;
}

export const defaultContactSortRules: ContactSortRule[] = [
  {
    id: "lastName",
    field: "lastName",
    direction: SortDirection.ASC,
  },
  {
    id: "firstName",
    field: "firstName",
    direction: SortDirection.ASC,
  },
];

export function getContactTableFilters(filters: DataTableFilter[]): ContactTableFilters {
  const contactGroupFilter = filters.find(
    (filter) => filter.type === "containment" && filter.filterId === "contactGroup" && filter.operator === "IN",
  );
  const birthdayFilter = filters.find(
    (filter) =>
      filter.type === "comparison" && filter.filterId === "birthdayAfter" && filter.operator === "GREATER_OR_EQUAL",
  );
  const emailFilter = filters.find(
    (filter) => filter.type === "text" && filter.filterId === "emailContains" && filter.operator === "CONTAINS",
  );

  return {
    birthdayAfter:
      birthdayFilter?.type === "comparison" && typeof birthdayFilter.value === "string" ? birthdayFilter.value : "",
    contactGroupIds: contactGroupFilter?.type === "containment" ? contactGroupFilter.value : [],
    emailContains: emailFilter?.type === "text" && emailFilter.value ? emailFilter.value : "",
  };
}

export function getContactSortRules(sorting: DataTableSort[]): ContactSortRule[] {
  const sortableFields = new Set<ContactSortField>(contactSortFieldOptions);
  const tableSortRules = sorting
    .filter((sort): sort is DataTableSort & { sortId: ContactSortField } =>
      sortableFields.has(sort.sortId as ContactSortField),
    )
    .map((sort) => ({
      id: sort.sortId,
      field: sort.sortId,
      direction: sort.direction === "ascending" ? SortDirection.ASC : SortDirection.DESC,
    }));

  return tableSortRules.length > 0 ? tableSortRules : defaultContactSortRules;
}
