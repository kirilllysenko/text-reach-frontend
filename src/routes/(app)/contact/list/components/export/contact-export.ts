import { fetchContacts as fetchContactList } from "$lib/api/contact/contact";
import type { DataTableFilter } from "$lib/components/table";
import {
  createMockContactList,
  filterMockContactList,
  sortContactList,
  toContactViewModel,
} from "$lib/feature/contact/contact-display";
import { buildContactRequest } from "$lib/feature/contact/contact-query";
import type { ContactTableSort } from "$lib/feature/contact/contact-sorting";
import type { ContactViewModel } from "$lib/feature/contact/contact-view-data";
import { getContactTableFilters } from "../filter/filter.svelte";

const EXPORT_PAGE_SIZE = 500;
const MAX_EXPORT_PAGES = 200;

export interface ContactExportSnapshot {
  filters: DataTableFilter[];
  search: string;
  sorting: ContactTableSort[];
}

export function buildContactExportRequest(snapshot: ContactExportSnapshot, cursor: unknown[] | null) {
  const filters = getContactTableFilters(snapshot.filters);

  return buildContactRequest({
    pageSize: EXPORT_PAGE_SIZE,
    cursor,
    search: snapshot.search,
    contactGroupIds: filters.contactGroupIds,
    birthdayAfter: filters.birthdayAfter,
    emailContains: filters.emailContains,
    sorts: snapshot.sorting,
  });
}

export async function loadContactExportList(
  snapshot: ContactExportSnapshot,
  fallbackContactList: ContactViewModel[] = createMockContactList(),
): Promise<ContactViewModel[]> {
  const contacts: ContactViewModel[] = [];
  let cursor: unknown[] | null = null;

  for (let page = 0; page < MAX_EXPORT_PAGES; page += 1) {
    const response = await fetchContactList(buildContactExportRequest(snapshot, cursor), { credentials: "include" });

    if (response.status !== 200) {
      return getFallbackContactExportList(snapshot, fallbackContactList);
    }

    contacts.push(
      ...(response.data.items ?? []).map((item, index) => toContactViewModel(item, contacts.length + index)),
    );
    cursor = response.data.nextCursor ?? null;

    if (!cursor || (response.data.items?.length ?? 0) === 0) {
      break;
    }
  }

  return contacts;
}

export function getFallbackContactExportList(
  snapshot: ContactExportSnapshot,
  fallbackContactList: ContactViewModel[],
): ContactViewModel[] {
  const filters = getContactTableFilters(snapshot.filters);

  return sortContactList(
    filterMockContactList(
      fallbackContactList,
      snapshot.search,
      filters.contactGroupIds,
      filters.birthdayAfter,
      filters.emailContains,
    ),
    snapshot.sorting,
  );
}

export function toContactCsv(contacts: ContactViewModel[]): string {
  const header = ["First Name", "Last Name", "Phone Number", "Email", "Birthday", "Groups", "Notes"];
  const rows = contacts.map((contact) => [
    contact.firstName,
    contact.lastName,
    contact.phoneNumber,
    contact.email,
    contact.birthday,
    contact.contactGroupIds.join("; "),
    contact.notes,
  ]);

  return [header, ...rows].map((row) => row.map(escapeCsvCell).join(",")).join("\n");
}

function escapeCsvCell(value: string): string {
  if (!/[",\n]/.test(value)) {
    return value;
  }

  return `"${value.replaceAll('"', '""')}"`;
}
