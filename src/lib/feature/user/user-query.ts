import { UsersStore } from "$houdini";
import type { UserDtoLike } from "./user-view-data";

const USER_PAGE_SIZE = 500;

export async function fetchAllUsers(): Promise<UserDtoLike[]> {
  const usersQuery = new UsersStore();
  const users: UserDtoLike[] = [];
  const seenCursors = new Set<string>();
  let after: string | undefined;

  while (true) {
    const response = await usersQuery.fetch({
      variables: {
        after,
        first: USER_PAGE_SIZE,
        sortBy: [{ email: { direction: "ASC" } }],
      },
    });

    if (response.errors || !response.data) {
      return Promise.reject(response.errors);
    }

    const connection = response.data.users;
    users.push(...connection.edges.map((edge) => edge.node));

    const cursor = connection.pageInfo.endCursor ?? undefined;
    if (!connection.pageInfo.hasNextPage || !cursor || seenCursors.has(cursor)) {
      return users;
    }

    seenCursors.add(cursor);
    after = cursor;
  }
}

export async function fetchUserById(id: string): Promise<UserDtoLike | null> {
  const users = await fetchAllUsers();
  return users.find((user) => user.id === id) ?? null;
}
