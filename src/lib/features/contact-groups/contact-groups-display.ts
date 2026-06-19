import type {
  ContactGroupDtoLike,
  ContactGroupSortField,
  ContactGroupSortRule,
  ContactGroupViewModel,
} from "$lib/features/contact-groups/contact-groups-view-data";

export function toContactGroupViewModel(dto: ContactGroupDtoLike, index: number): ContactGroupViewModel {
  return {
    id: dto.id ?? `contact-group-${index + 1}`,
    name: dto.name?.trim() || "Unnamed group",
    contactCount: dto.contactCount ?? 0,
  };
}

export function createMockContactGroups(): ContactGroupViewModel[] {
  return [
    {
      id: "mock-group-1",
      name: "High Value Customers",
      contactCount: 128,
    },
    {
      id: "mock-group-2",
      name: "Newsletter Subscribers",
      contactCount: 842,
    },
    {
      id: "mock-group-3",
      name: "Recent Signups",
      contactCount: 76,
    },
    {
      id: "mock-group-4",
      name: "Reactivation - February",
      contactCount: 214,
    },
  ];
}

export function filterMockContactGroups(
  groups: ContactGroupViewModel[],
  search: string,
  minContactCount: string,
  maxContactCount: string,
): ContactGroupViewModel[] {
  const searchValue = search.trim().toLowerCase();
  const minContacts = parseCountFilter(minContactCount);
  const maxContacts = parseCountFilter(maxContactCount);

  return groups.filter((group) => {
    if (searchValue && !group.name.toLowerCase().includes(searchValue)) {
      return false;
    }

    if (minContacts !== null && group.contactCount < minContacts) {
      return false;
    }

    return !(maxContacts !== null && group.contactCount > maxContacts);
  });
}

export function sortContactGroups(
  groups: ContactGroupViewModel[],
  sortRules: ContactGroupSortRule[],
): ContactGroupViewModel[] {
  return [...groups].sort((left, right) => {
    for (const rule of sortRules) {
      const result = compareContactGroupField(left, right, rule.field);

      if (result !== 0) {
        return rule.direction === "ASC" ? result : -result;
      }
    }

    return left.id.localeCompare(right.id);
  });
}

function parseCountFilter(value: string): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function compareContactGroupField(
  left: ContactGroupViewModel,
  right: ContactGroupViewModel,
  field: ContactGroupSortField,
): number {
  if (field === "contactCount") {
    return left.contactCount - right.contactCount;
  }

  return left.name.localeCompare(right.name, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}
