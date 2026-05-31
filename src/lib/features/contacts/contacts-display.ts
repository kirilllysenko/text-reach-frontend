import type { ContactGroupDto } from "$lib/api/index.schemas";
import type {
  ContactDtoLike,
  ContactSortField,
  ContactSortRule,
  ContactViewModel,
} from "$lib/features/contacts/contacts-view-data";

export const defaultContactGroupNameById: Record<string, string> = {
  "mock-group-1": "High Value Customers",
  "mock-group-2": "Newsletter Subscribers",
  "mock-group-3": "Recent Signups",
  "mock-group-4": "Reactivation - February",
};

export function mergeContactGroupNames(
  currentNames: Record<string, string>,
  groups: ContactGroupDto[],
): Record<string, string> {
  const names = { ...currentNames };

  for (const group of groups) {
    if (!group.id || !group.name) {
      continue;
    }

    names[group.id] = group.name;
  }

  return names;
}

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

export function createMockContacts(): ContactViewModel[] {
  return [
    {
      id: "mock-contact-1",
      fullName: "Avery Johnson",
      firstName: "Avery",
      lastName: "Johnson",
      phoneNumber: "+1 (415) 555-0127",
      email: "avery@example.com",
      birthday: "1990-04-18",
      notes: "VIP customer",
      contactGroupIds: ["mock-group-1", "mock-group-2"],
    },
    {
      id: "mock-contact-2",
      fullName: "Mia Chen",
      firstName: "Mia",
      lastName: "Chen",
      phoneNumber: "+1 (628) 555-0194",
      email: "mia@example.com",
      birthday: "1988-11-03",
      notes: "Prefers afternoon texts",
      contactGroupIds: ["mock-group-2"],
    },
    {
      id: "mock-contact-3",
      fullName: "Noah Patel",
      firstName: "Noah",
      lastName: "Patel",
      phoneNumber: "+1 (510) 555-0148",
      email: "noah@example.com",
      birthday: "1995-07-22",
      notes: "",
      contactGroupIds: ["mock-group-3"],
    },
    {
      id: "mock-contact-4",
      fullName: "Sofia Ramirez",
      firstName: "Sofia",
      lastName: "Ramirez",
      phoneNumber: "+1 (650) 555-0176",
      email: "sofia@example.com",
      birthday: "1985-02-09",
      notes: "Reactivation candidate",
      contactGroupIds: ["mock-group-4"],
    },
  ];
}

export function filterMockContacts(
  contacts: ContactViewModel[],
  search: string,
  contactGroupIds: string[],
  birthdayAfter: string,
  emailContains: string,
): ContactViewModel[] {
  const searchValue = search.trim().toLowerCase();
  const emailValue = emailContains.trim().toLowerCase();

  return contacts.filter((contact) => {
    const searchable = [contact.fullName, contact.phoneNumber, contact.email, contact.notes].join(" ").toLowerCase();

    if (searchValue && !searchable.includes(searchValue)) {
      return false;
    }

    if (contactGroupIds.length > 0 && !contact.contactGroupIds.some((groupId) => contactGroupIds.includes(groupId))) {
      return false;
    }

    if (birthdayAfter && contact.birthday && contact.birthday < birthdayAfter) {
      return false;
    }

    if (birthdayAfter && !contact.birthday) {
      return false;
    }

    return !(emailValue && !contact.email.toLowerCase().includes(emailValue));
  });
}

export function sortContacts(contacts: ContactViewModel[], sortRules: ContactSortRule[]): ContactViewModel[] {
  return [...contacts].sort((left, right) => {
    for (const rule of sortRules) {
      const result = compareContactField(left, right, rule.field);

      if (result !== 0) {
        return rule.direction === "ASC" ? result : -result;
      }
    }

    return left.id.localeCompare(right.id);
  });
}

function compareContactField(left: ContactViewModel, right: ContactViewModel, field: ContactSortField): number {
  return String(left[field] ?? "").localeCompare(String(right[field] ?? ""), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function formatBirthday(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}
