import { ContactsStore } from "$houdini";
import type { DataTableFilter, DataTableSort } from "$lib/components/table";
import { toContactViewModel } from "$lib/feature/contact/contact-display";
import { buildContactRequest, type ContactQueryVariables } from "$lib/feature/contact/contact-query";
import type { ContactViewModel } from "$lib/feature/contact/contact-view-data";
import { contactTableFilters } from "../filter/filter.svelte";
import { contactTableSorts } from "../sort/sort.svelte";

const EXPORT_PAGE_SIZE = 500;
const MAX_EXPORT_PAGES = 200;
const contactsQuery = new ContactsStore();

export interface ContactExportSnapshot {
  filters: DataTableFilter[];
  search: string;
  sorting: DataTableSort[];
}

export function buildContactExportRequest(
  snapshot: ContactExportSnapshot,
  cursor: unknown[] | null,
): ContactQueryVariables {
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
    const variables: ContactQueryVariables = buildContactExportRequest(snapshot, cursor);
    const response = await contactsQuery.fetch({ variables });

    if (response.errors || !response.data) {
      throw new Error("Could not load contacts for export.");
    }

    const result = response.data.contacts;

    contacts.push(...result.edges.map((edge, index) => toContactViewModel(edge.node, contacts.length + index)));
    cursor = result.pageInfo.hasNextPage && result.pageInfo.endCursor ? [result.pageInfo.endCursor] : null;

    if (!cursor || result.edges.length === 0) {
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
