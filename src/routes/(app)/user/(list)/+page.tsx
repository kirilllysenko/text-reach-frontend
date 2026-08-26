import { createMemo, createSignal, onSettled } from "solid-js";
import { UsersDocument, type Role, type UsersQuery } from "~/gql/graphql";
import { PATH_USER_ADD } from "~/lib/app/paths";
import { Card, Input, LinkButton, PageTitle, VirtualTable, type VirtualColumn } from "~/components";
import { userRoleLabelMap, userRoleOptions } from "~/lib/feature/user/user-view-data";
import { graphqlClient } from "~/lib/graphql/client";
import { UserActions } from "./components/UserActions";

type UserRow = UsersQuery["users"]["edges"][number]["node"];
type SortField = "email" | "name" | "role";

const userPageSize = 500;

export default function UsersPage() {
  const [users, setUsers] = createSignal<UserRow[]>([]);
  const [search, setSearch] = createSignal("");
  const [role, setRole] = createSignal<Role | "">("");
  const [sortField, setSortField] = createSignal<SortField>("email");
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  const visibleUsers = createMemo(() => {
    const query = search().trim().toLocaleLowerCase();
    const filtered = users().filter(
      (user) =>
        (!role() || user.role === role()) &&
        (!query || `${user.name ?? ""} ${user.email} ${user.id}`.toLocaleLowerCase().includes(query)),
    );
    const field = sortField();
    return [...filtered].sort((left, right) => {
      const leftValue = field === "role" ? userRoleLabelMap[left.role] : (left[field] ?? "");
      const rightValue = field === "role" ? userRoleLabelMap[right.role] : (right[field] ?? "");
      return leftValue.localeCompare(rightValue);
    });
  });

  const columns: VirtualColumn<UserRow>[] = [
    { id: "name", header: "Name", width: "minmax(10rem, 1fr)", cell: (user) => user.name?.trim() || "Unnamed user" },
    { id: "email", header: "Email", width: "minmax(14rem, 1.25fr)", cell: (user) => user.email },
    { id: "role", header: "Role", width: "9rem", cell: (user) => userRoleLabelMap[user.role] },
    { id: "id", header: "ID", width: "minmax(12rem, 1fr)", cell: (user) => user.id },
    {
      id: "actions",
      header: "",
      width: "9rem",
      align: "right",
      cell: (user) => <UserActions user={user} onDeleted={loadUsers} />,
    },
  ];

  onSettled(() => void loadUsers());

  async function loadUsers(): Promise<void> {
    setLoading(true);
    setError(null);
    const nextUsers: UserRow[] = [];
    const seenCursors = new Set<string>();
    let after: string | undefined;

    try {
      while (true) {
        const response = await graphqlClient.query(
          UsersDocument,
          { after, first: userPageSize, sortBy: [{ email: { direction: "ASC" } }] },
          { requestPolicy: "network-only" },
        );
        if (response.error || !response.data) throw new Error();
        nextUsers.push(...response.data.users.edges.map((edge) => edge.node));
        const cursor = response.data.users.pageInfo.endCursor ?? undefined;
        if (!response.data.users.pageInfo.hasNextPage || !cursor || seenCursors.has(cursor)) break;
        seenCursors.add(cursor);
        after = cursor;
      }
      setUsers(nextUsers);
    } catch {
      setError("Could not load users.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      class={`relative flex h-dvh min-h-0 flex-col gap-3 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50 to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3`}
    >
      <PageTitle title="Users">
        <LinkButton href={PATH_USER_ADD}>Add user</LinkButton>
      </PageTitle>
      <Card variant="panel" class="shrink-0">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            class="min-w-0 grow"
            placeholder="Search users"
            value={search()}
            onInput={(event) => setSearch(event.currentTarget.value)}
          />
          <select
            class="glass-input h-10 px-3 text-sm text-slate-700"
            value={role()}
            onChange={(event) => setRole(event.currentTarget.value as Role | "")}
            aria-label="Filter by role"
          >
            <option value="">All roles</option>
            {userRoleOptions.map((option) => (
              <option value={option}>{userRoleLabelMap[option]}</option>
            ))}
          </select>
          <select
            class="glass-input h-10 px-3 text-sm text-slate-700"
            value={sortField()}
            onChange={(event) => setSortField(event.currentTarget.value as SortField)}
            aria-label="Sort users"
          >
            <option value="email">Email</option>
            <option value="name">Name</option>
            <option value="role">Role</option>
          </select>
        </div>
      </Card>
      <Card variant="table">
        <VirtualTable
          columns={columns}
          rows={visibleUsers()}
          getRowId={(user) => user.id}
          loading={loading()}
          error={error()}
        />
      </Card>
    </div>
  );
}
