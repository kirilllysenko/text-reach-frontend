import type { ContactDto, SortDirection } from "$lib/api/index.schemas";

export interface ContactViewModel {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  birthday: string;
  notes: string;
  contactGroupIds: string[];
}

export type ContactSortField = "firstName" | "lastName" | "phoneNumber" | "email" | "birthday";

export interface ContactSortRule {
  id: string;
  field: ContactSortField;
  direction: SortDirection;
}

export type ContactDtoLike = Pick<
  ContactDto,
  "birthday" | "contactGroupIds" | "email" | "firstName" | "id" | "lastName" | "notes" | "phoneNumber"
>;

export const contactSortFieldOptions: ContactSortField[] = [
  "firstName",
  "lastName",
  "phoneNumber",
  "email",
  "birthday",
];

export const contactSortFieldLabelMap: Record<ContactSortField, string> = {
  firstName: "First Name",
  lastName: "Last Name",
  phoneNumber: "Phone Number",
  email: "Email",
  birthday: "Birthday",
};
