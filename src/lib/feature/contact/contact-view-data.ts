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

export interface ContactDtoLike {
  readonly birthday?: string | null;
  readonly contactGroups?: readonly { readonly id: string }[] | null;
  readonly email?: string | null;
  readonly firstName?: string | null;
  readonly id: string;
  readonly lastName?: string | null;
  readonly notes?: string | null;
  readonly phoneNumber: string;
}
