import { ContactExportContactsQueryStore } from "$houdini";
import type {
  ContactExportContactsQuery$input,
  ContactExportContactsQuery$result,
} from "$houdini/artifacts/ContactExportContactsQuery";
import type { ContactSortByInput } from "$houdini/graphql/inputs";
import type { DataTableFilter } from "$lib/components/table";
import { contactTableFilters } from "../filter/filter.svelte";

const EXPORT_PAGE_SIZE = 500;
const MAX_EXPORT_PAGES = 200;
const contactsQuery = new ContactExportContactsQueryStore();

export type ContactExportRow = ContactExportContactsQuery$result["contacts"]["edges"][number]["node"];

export interface ContactExportSnapshot {
  filters: DataTableFilter[];
  search: string;
  sorts: ContactSortByInput[];
}

export function buildContactExportRequest(
  snapshot: ContactExportSnapshot,
  cursor: string | null,
): ContactExportContactsQuery$input {
  const filters = contactTableFilters.toDtos(getContactExportFilters(snapshot));

  return {
    after: cursor,
    filter: filters.length > 0 ? { operator: "AND", nested: filters } : undefined,
    first: EXPORT_PAGE_SIZE,
    sortBy: snapshot.sorts,
  };
}

function getContactExportFilters(snapshot: ContactExportSnapshot): DataTableFilter[] {
  const search = snapshot.search.trim();
  if (!search || snapshot.filters.some((filter) => filter.filterId === "search")) {
    return snapshot.filters;
  }

  return [{ filterId: "search", type: "text", operator: "CONTAINS", value: search }, ...snapshot.filters];
}

export async function loadContactExportList(snapshot: ContactExportSnapshot): Promise<ContactExportRow[]> {
  const contacts: ContactExportRow[] = [];
  let cursor: string | null = null;

  for (let page = 0; page < MAX_EXPORT_PAGES; page += 1) {
    const variables = buildContactExportRequest(snapshot, cursor);
    const response = await contactsQuery.fetch({ variables });

    if (response.errors || !response.data) {
      throw new Error("Could not load contacts for export.");
    }

    const result = response.data.contacts;

    contacts.push(...result.edges.map((edge) => edge.node));
    cursor = result.pageInfo.hasNextPage ? result.pageInfo.endCursor : null;

    if (!cursor || result.edges.length === 0) {
      break;
    }
  }

  return contacts;
}

export function toContactCsv(contacts: readonly ContactExportRow[]): string {
  const header = ["First Name", "Last Name", "Phone Number", "Email", "Birthday", "Groups", "Notes"];
  const rows = contacts.map((contact) => [
    contact.firstName,
    contact.lastName,
    contact.phoneNumber,
    contact.email,
    contact.birthday,
    contact.contactGroups.map((group) => group.id).join("; "),
    contact.notes,
  ]);

  return [header, ...rows].map((row) => row.map(escapeCsvCell).join(",")).join("\n");
}

function escapeCsvCell(value: string | null): string {
  const text = value ?? "";

  if (!/[",\n]/.test(text)) {
    return text;
  }

  return `"${text.replaceAll('"', '""')}"`;
}
