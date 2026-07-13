import type { ContactDtoLike, ContactViewModel } from "$lib/feature/contact/contact-view-data";

export function toContactViewModel(dto: ContactDtoLike, index: number): ContactViewModel {
  const firstName = dto.firstName?.trim() ?? "";
  const lastName = dto.lastName?.trim() ?? "";
  const fullName = [firstName, lastName].filter((value) => value).join(" ");

  return {
    id: dto.id ?? `contact-${index + 1}`,
    fullName: fullName || "Unnamed contact",
    firstName,
    lastName,
    phoneNumber: dto.phoneNumber ?? "",
    email: dto.email ?? "",
    birthday: formatBirthday(dto.birthday),
    notes: dto.notes ?? "",
    contactGroupIds: dto.contactGroupIds ?? [],
  };
}

function formatBirthday(value: string | null | undefined): string {
  return value?.slice(0, 10) ?? "";
}
