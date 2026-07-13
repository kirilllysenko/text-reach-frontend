import type { ContactDto } from "$lib/api/index.schemas";

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

export type ContactDtoLike = Pick<
  ContactDto,
  "birthday" | "contactGroupIds" | "email" | "firstName" | "id" | "lastName" | "notes" | "phoneNumber"
>;
