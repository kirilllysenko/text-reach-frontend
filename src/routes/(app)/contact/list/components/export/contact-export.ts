import { fetchContacts as fetchContactList } from "$lib/api/contact/contact";
import type { DataTableFilter, DataTableSort } from "$lib/components/table";
import { toContactViewModel } from "$lib/feature/contact/contact-display";
import { buildContactRequest } from "$lib/feature/contact/contact-query";
import type { ContactViewModel } from "$lib/feature/contact/contact-view-data";
import { contactTableFilters } from "../filter/filter.svelte";
import { contactTableSorts } from "../sort/sort.svelte";

const EXPORT_PAGE_SIZE = 500;
const MAX_EXPORT_PAGES = 200;

export interface ContactExportSnapshot {
  filters: DataTableFilter[];
  search: string;
  sorting: DataTableSort[];
}

export function buildContactExportRequest(snapshot: ContactExportSnapshot, cursor: unknown[] | null) {
  return buildContactRequest({
    pageSize: EXPORT_PAGE_SIZE,
    cursor,
    filters: contactTableFilters.toDtos(getContactExportFilters(snapshot)),
    sort: contactTableSorts.toBackend(snapshot.sorting),
  });
}

function getContactExportFilters(snapshot: ContactExportSnapshot): DataTableFilter[] {
  const search = snapshot.search.trim();
  if (!search || snapshot.filters.some((filter) => filter.filterId === "search")) {
    return snapshot.filters;
  }

  return [{ filterId: "search", type: "text", operator: "CONTAINS", value: search }, ...snapshot.filters];
}

export async function loadContactExportList(snapshot: ContactExportSnapshot): Promise<ContactViewModel[]> {
  const contacts: ContactViewModel[] = [];
  let cursor: unknown[] | null = null;

  for (let page = 0; page < MAX_EXPORT_PAGES; page += 1) {
    const response = await fetchContactList(buildContactExportRequest(snapshot, cursor), { credentials: "include" });

    if (response.status !== 200) {
      throw new Error("Could not load contacts for export.");
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
