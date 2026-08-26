import { createMemo, createSignal, onSettled, Show } from "solid-js";
import {
  ContactTableQueryDocument,
  DeleteContactsDocument,
  RequestContactExportDocument,
  type ContactExportFormat,
  type ContactFilterInput,
  type ContactSortByInput,
  type ContactTableQueryQuery,
} from "~/gql/graphql";
import {
  PATH_CONTACT_ADD,
  PATH_CONTACT_EXPORT_HISTORY,
  PATH_CONTACT_IMPORT,
  PATH_CONTACT_IMPORT_HISTORY,
  buildContactEditPath,
} from "~/lib/app/paths";
import { Button, Card, Input, LinkButton, PageTitle, VirtualTable, type VirtualColumn } from "~/components";
import { formatPhoneNumber } from "~/lib/feature/phone/phone-display";
import { defaultErrorText } from "~/lib/form/errors";
import { graphqlClient } from "~/lib/graphql/client";
import { showError, showInfo } from "~/lib/state/notifications";
import { hasAccess } from "~/lib/state/session";

type ContactRow = ContactTableQueryQuery["contacts"]["edges"][number]["node"];
type ContactSort = "name" | "phone" | "email" | "birthday";

export default function ContactsPage() {
  const [contacts, setContacts] = createSignal<ContactRow[]>([]);
  const [search, setSearch] = createSignal("");
  const [sort, setSort] = createSignal<ContactSort>("name");
  const [selectedIds, setSelectedIds] = createSignal<Set<string>>(new Set());
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [confirmDelete, setConfirmDelete] = createSignal(false);
  const [deleting, setDeleting] = createSignal(false);
  const [exportFormat, setExportFormat] = createSignal<ContactExportFormat>("CSV");
  const [exporting, setExporting] = createSignal(false);
  const canWrite = () => hasAccess("CONTACT_WRITE");

  const visibleContacts = createMemo(() => {
    const query = search().trim().toLocaleLowerCase();
    const rows = contacts().filter(
      (contact) =>
        !query ||
        `${contact.firstName ?? ""} ${contact.lastName ?? ""} ${contact.phoneNumber} ${contact.email ?? ""}`
          .toLocaleLowerCase()
          .includes(query),
    );
    return [...rows].sort((left, right) => {
      const leftValue = contactSortValue(left, sort());
      const rightValue = contactSortValue(right, sort());
      return leftValue.localeCompare(rightValue);
    });
  });

  const columns: VirtualColumn<ContactRow>[] = [
    {
      id: "selected",
      header: "",
      width: "3rem",
      cell: (contact) => (
        <input
          type="checkbox"
          checked={selectedIds().has(contact.id)}
          aria-label={`Select ${contact.firstName ?? "contact"}`}
          onChange={(event) => toggleContact(contact.id, event.currentTarget.checked)}
        />
      ),
    },
    { id: "name", header: "Name", width: "minmax(12rem, 1fr)", cell: (contact) => contactName(contact) },
    { id: "phone", header: "Phone", width: "12rem", cell: (contact) => formatPhoneNumber(contact.phoneNumber) },
    { id: "email", header: "Email", width: "minmax(14rem, 1fr)", cell: (contact) => contact.email ?? "—" },
    { id: "birthday", header: "Birthday", width: "9rem", cell: (contact) => contact.birthday ?? "—" },
    {
      id: "groups",
      header: "Groups",
      width: "minmax(12rem, 1fr)",
      cell: (contact) => contact.contactGroups.map((group) => group.id).join(", ") || "—",
    },
    { id: "notes", header: "Notes", width: "minmax(12rem, 1fr)", cell: (contact) => contact.notes ?? "—" },
    {
      id: "actions",
      header: "",
      width: "5rem",
      align: "right",
      cell: (contact) =>
        canWrite() ? (
          <a
            href={buildContactEditPath(contact.id)}
            class="inline-flex h-7 items-center rounded-lg border border-white/80 bg-white/80 px-2 text-sm text-sky-700 shadow-sm hover:bg-white"
          >
            Edit
          </a>
        ) : null,
    },
  ];

  onSettled(() => void loadContacts());

  function toggleContact(id: string, selected: boolean): void {
    setSelectedIds((current) => {
      const next = new Set(current);
      selected ? next.add(id) : next.delete(id);
      return next;
    });
  }

  async function loadContacts(): Promise<void> {
    setLoading(true);
    setError(null);
    const nextContacts: ContactRow[] = [];
    const seenCursors = new Set<string>();
    let after: string | undefined;
    try {
      while (true) {
        const response = await graphqlClient.query(
          ContactTableQueryDocument,
          { after, first: 500, sortBy: contactSortInput(sort()) },
          { requestPolicy: "network-only" },
        );
        if (response.error || !response.data) throw new Error();
        nextContacts.push(...response.data.contacts.edges.map((edge) => edge.node));
        const cursor = response.data.contacts.pageInfo.endCursor ?? undefined;
        if (!response.data.contacts.pageInfo.hasNextPage || !cursor || seenCursors.has(cursor)) break;
        seenCursors.add(cursor);
        after = cursor;
      }
      setContacts(nextContacts);
    } catch {
      setError("Could not load contacts.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteSelected(): Promise<void> {
    if (selectedIds().size === 0) return;
    setDeleting(true);
    try {
      const filter: ContactFilterInput = { id: { in: [...selectedIds()] } };
      const response = await graphqlClient.mutation(DeleteContactsDocument, { filter });
      if (response.error || !response.data?.deleteContacts) {
        showError(defaultErrorText);
        return;
      }
      showInfo(
        selectedIds().size === 1 ? "Contact has been deleted." : `${selectedIds().size} contacts have been deleted.`,
      );
      setSelectedIds(new Set<string>());
      setConfirmDelete(false);
      await loadContacts();
    } catch {
      showError(defaultErrorText);
    } finally {
      setDeleting(false);
    }
  }

  async function requestExport(): Promise<void> {
    if (exporting()) return;
    setExporting(true);
    try {
      const query = search().trim();
      const response = await graphqlClient.mutation(RequestContactExportDocument, {
        input: {
          filter: query ? { filter: query } : undefined,
          format: exportFormat(),
          sortBy: contactSortInput(sort()),
        },
      });
      if (response.error || !response.data?.requestContactExport.contactExport) throw new Error();
      showInfo("Contact export has been queued.");
    } catch {
      showError("Could not export contacts.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <div class="relative flex h-dvh min-h-0 flex-col gap-3 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50 to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3">
        <PageTitle title="Contacts">
          <div class="flex items-center gap-2">
            <Show when={canWrite()}>
              <LinkButton href={PATH_CONTACT_ADD}>Add contact</LinkButton>
              <LinkButton href={PATH_CONTACT_IMPORT}>Import</LinkButton>
            </Show>
            <select
              class="glass-input h-10 px-3 text-sm text-slate-700"
              value={exportFormat()}
              onChange={(event) => setExportFormat(event.currentTarget.value as ContactExportFormat)}
              aria-label="Contact export format"
            >
              <option value="CSV">CSV</option>
              <option value="EXCEL">Excel</option>
            </select>
            <Button variant="secondary" spinner={exporting()} onClick={() => void requestExport()}>
              Export
            </Button>
            <LinkButton href={PATH_CONTACT_EXPORT_HISTORY}>Exports</LinkButton>
          </div>
        </PageTitle>
        <Card variant="panel" class="shrink-0">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              class="min-w-0 grow"
              placeholder="Search contacts"
              value={search()}
              onInput={(event) => setSearch(event.currentTarget.value)}
            />
            <select
              class="glass-input h-10 px-3 text-sm text-slate-700"
              value={sort()}
              onChange={(event) => setSort(event.currentTarget.value as ContactSort)}
              aria-label="Sort contacts"
            >
              <option value="name">Name</option>
              <option value="phone">Phone</option>
              <option value="email">Email</option>
              <option value="birthday">Birthday</option>
            </select>
            <Show when={canWrite()}>
              <Button variant="secondary" disabled={selectedIds().size === 0} onClick={() => setConfirmDelete(true)}>
                {selectedIds().size ? `Delete selected (${selectedIds().size})` : "Delete selected"}
              </Button>
            </Show>
            <a class="text-sm" href={PATH_CONTACT_IMPORT_HISTORY}>
              Import history
            </a>
          </div>
        </Card>
        <Card variant="table">
          <VirtualTable
            columns={columns}
            rows={visibleContacts()}
            getRowId={(contact) => contact.id}
            loading={loading()}
            error={error()}
          />
        </Card>
      </div>
      <Show when={confirmDelete()}>
        <div class="fixed inset-0 z-60 flex items-center justify-center">
          <button
            class="absolute inset-0 bg-slate-900/35"
            type="button"
            aria-label="Cancel deleting contacts"
            onClick={() => setConfirmDelete(false)}
          />
          <div class="relative z-10 mx-3 max-w-lg rounded-2xl border border-white/80 bg-white/95 p-5 shadow-xl">
            <h2>Delete selected contacts?</h2>
            <p class="mt-2 text-sm text-slate-600">
              {selectedIds().size} selected contacts will be permanently deleted.
            </p>
            <div class="mt-5 flex justify-end gap-2">
              <Button variant="secondary" disabled={deleting()} onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
              <Button spinner={deleting()} onClick={() => void deleteSelected()}>
                Delete contacts
              </Button>
            </div>
          </div>
        </div>
      </Show>
    </>
  );
}

function contactName(contact: ContactRow): string {
  return [contact.firstName, contact.lastName].filter(Boolean).join(" ") || "Unnamed contact";
}

function contactSortValue(contact: ContactRow, sort: ContactSort): string {
  if (sort === "name") return `${contact.lastName ?? ""} ${contact.firstName ?? ""}`;
  if (sort === "phone") return contact.phoneNumber;
  return contact[sort] ?? "";
}

function contactSortInput(sort: ContactSort): ContactSortByInput[] {
  if (sort === "name") return [{ lastName: { direction: "ASC" } }, { firstName: { direction: "ASC" } }];
  if (sort === "phone") return [{ phoneNumber: { direction: "ASC" } }];
  return [{ [sort]: { direction: "ASC" } }];
}
