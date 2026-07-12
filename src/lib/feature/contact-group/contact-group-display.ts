import type { ContactGroupDtoLike, ContactGroupViewModel } from "$lib/feature/contact-group/contact-group-view-data";
import type { ContactGroupTableSort } from "$lib/feature/contact-group/contact-group-sorting";

export function toContactGroupViewModel(dto: ContactGroupDtoLike, index: number): ContactGroupViewModel {
  return {
    id: dto.id ?? `contact-group-${index + 1}`,
    name: dto.name?.trim() || "Unnamed group",
    contactCount: dto.contactCount ?? 0,
  };
}

export function createMockContactGroupList(): ContactGroupViewModel[] {
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

export function filterMockContactGroupList(
  groups: ContactGroupViewModel[],
  search: string,
  minContactCount: string,
  maxContactCount: string,
): ContactGroupViewModel[] {
  const searchValue = search.trim().toLowerCase();
  const minContactTotal = parseCountFilter(minContactCount);
  const maxContactTotal = parseCountFilter(maxContactCount);

  return groups.filter((group) => {
    if (searchValue && !group.name.toLowerCase().includes(searchValue)) {
      return false;
    }

    if (minContactTotal !== null && group.contactCount < minContactTotal) {
      return false;
    }

    return !(maxContactTotal !== null && group.contactCount > maxContactTotal);
  });
}

export function sortContactGroupList(
  groups: ContactGroupViewModel[],
  sorts: readonly ContactGroupTableSort[],
): ContactGroupViewModel[] {
  return [...groups].sort((left, right) => {
    for (const sort of sorts) {
      const result = compareContactGroupField(left, right, sort.sortId);

      if (result !== 0) {
        return sort.direction === "ascending" ? result : -result;
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
  field: ContactGroupTableSort["sortId"],
): number {
  if (field === "contactCount") {
    return left.contactCount - right.contactCount;
  }

  return left.name.localeCompare(right.name, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}
