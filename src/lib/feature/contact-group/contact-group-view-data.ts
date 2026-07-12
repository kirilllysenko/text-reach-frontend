import type { ContactGroupDto } from "$lib/api/index.schemas";

export interface ContactGroupViewModel {
  id: string;
  name: string;
  contactCount: number;
}

export type ContactGroupDtoLike = Pick<ContactGroupDto, "contactCount" | "id" | "name">;
