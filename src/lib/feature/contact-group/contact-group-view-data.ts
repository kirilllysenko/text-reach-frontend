import type { SortDirection$options } from "$houdini/graphql/enums";

export interface ContactGroupViewModel {
  id: string;
  name: string;
  contactCount: number;
}

export type ContactGroupSortField = "name" | "contactCount";

export interface ContactGroupSortRule {
  id: string;
  field: ContactGroupSortField;
  direction: SortDirection$options;
}

export interface ContactGroupDtoLike {
  readonly contactCount: number;
  readonly id: string;
  readonly name: string;
}

export const contactGroupSortFieldOptions: ContactGroupSortField[] = ["name", "contactCount"];

export const contactGroupSortFieldLabelMap: Record<ContactGroupSortField, string> = {
  name: "Name",
  contactCount: "Contact Count",
};
