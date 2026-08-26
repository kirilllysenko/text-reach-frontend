import { createMemo, createSignal, onSettled } from "solid-js";
import { ContactGroupsDocument, type ContactGroupsQuery } from "~/gql/graphql";
import { PATH_CONTACT_GROUP_ADD, buildContactGroupEditPath } from "~/lib/app/paths";
import { Card, Input, LinkButton, PageTitle, VirtualTable, type VirtualColumn } from "~/components";
import { graphqlClient } from "~/lib/graphql/client";
import { hasAccess } from "~/lib/state/session";

type ContactGroupRow = ContactGroupsQuery["contactGroups"]["edges"][number]["node"];

export default function ContactGroupsPage() {
  const [rows, setRows] = createSignal<ContactGroupRow[]>([]);
  const [search, setSearch] = createSignal("");
  const [sortBy, setSortBy] = createSignal<"name" | "contactCount">("name");
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const visibleRows = createMemo(() => {
    const query = search().trim().toLocaleLowerCase();
    return [...rows().filter((row) => !query || row.name.toLocaleLowerCase().includes(query))].sort((a, b) =>
      sortBy() === "name" ? a.name.localeCompare(b.name) : b.contactCount - a.contactCount,
    );
  });
  const columns: VirtualColumn<ContactGroupRow>[] = [
    { id: "name", header: "Name", width: "minmax(15rem, 1fr)", cell: (row) => row.name },
    { id: "contacts", header: "Contacts", width: "9rem", cell: (row) => row.contactCount },
    { id: "id", header: "ID", width: "minmax(14rem, 1fr)", cell: (row) => row.id },
    {
      id: "action",
      header: "",
      width: "5rem",
      align: "right",
      cell: (row) =>
        hasAccess("CONTACT_WRITE") ? (
          <a
            href={buildContactGroupEditPath(row.id)}
            class="inline-flex h-7 items-center rounded-lg border border-white/80 bg-white/80 px-2 text-sm text-sky-700"
          >
            Edit
          </a>
        ) : null,
    },
  ];

  onSettled(() => void loadGroups());
  async function loadGroups(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const response = await graphqlClient.query(
        ContactGroupsDocument,
        { first: 500, sortBy: [{ name: { direction: "ASC" } }] },
        { requestPolicy: "network-only" },
      );
      if (response.error || !response.data) throw new Error();
      setRows(response.data.contactGroups.edges.map((edge) => edge.node));
    } catch {
      setError("Could not load contact groups.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div class="relative flex h-dvh min-h-0 flex-col gap-3 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50 to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3">
      <PageTitle title="Contact Groups">
        {hasAccess("CONTACT_WRITE") && <LinkButton href={PATH_CONTACT_GROUP_ADD}>Add contact group</LinkButton>}
      </PageTitle>
      <Card variant="panel" class="shrink-0">
        <div class="flex gap-2">
          <Input
            class="min-w-0 grow"
            placeholder="Search contact groups"
            value={search()}
            onInput={(event) => setSearch(event.currentTarget.value)}
          />
          <select
            class="glass-input h-10 px-3 text-sm"
            value={sortBy()}
            onChange={(event) => setSortBy(event.currentTarget.value as "name" | "contactCount")}
          >
            <option value="name">Name</option>
            <option value="contactCount">Contacts</option>
          </select>
        </div>
      </Card>
      <Card variant="table">
        <VirtualTable
          columns={columns}
          rows={visibleRows()}
          getRowId={(row) => row.id}
          loading={loading()}
          error={error()}
        />
      </Card>
    </div>
  );
}
