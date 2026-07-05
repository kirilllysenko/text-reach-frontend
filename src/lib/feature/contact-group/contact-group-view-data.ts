import type { ContactGroupDto, SortDirection } from "$lib/api/index.schemas";

export interface ContactGroupViewModel {
  id: string;
  name: string;
  contactCount: number;
}

export type ContactGroupSortField = "name" | "contactCount";

export interface ContactGroupSortRule {
  id: string;
  field: ContactGroupSortField;
  direction: SortDirection;
}

export type ContactGroupDtoLike = Pick<ContactGroupDto, "contactCount" | "id" | "name">;

export const contactGroupSortFieldOptions: ContactGroupSortField[] = ["name", "contactCount"];

export const contactGroupSortFieldLabelMap: Record<ContactGroupSortField, string> = {
  name: "Name",
  contactCount: "Contact Count",
};
