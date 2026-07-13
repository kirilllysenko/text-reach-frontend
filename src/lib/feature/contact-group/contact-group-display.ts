import type { ContactGroupDtoLike, ContactGroupViewModel } from "$lib/feature/contact-group/contact-group-view-data";

export function toContactGroupViewModel(dto: ContactGroupDtoLike, index: number): ContactGroupViewModel {
  return {
    id: dto.id ?? `contact-group-${index + 1}`,
    name: dto.name?.trim() || "Unnamed group",
    contactCount: dto.contactCount ?? 0,
  };
}
