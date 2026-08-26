import { UsersStore } from "$houdini";
import {
  DatagridCore,
  filteringFeature,
  globalSearchFeature,
  sortingFeature,
  type DataTableSort,
} from "text-reach-frontend-library/components/table";
import { userFilterDefinitions } from "../filter/filter.svelte";
import { userSortDefinitions } from "../sort/sort.svelte";
import { createUserColumns, type UserTableRow } from "./column.svelte";

const initialSorting = [{ sortId: "email", direction: "ascending" }] satisfies DataTableSort[];

const USER_PAGE_SIZE = 500;

interface UserTableOptions {
  onDeleted: () => Promise<void>;
}

export function createUserTable(options: UserTableOptions): DatagridCore<UserTableRow> {
  return new DatagridCore<UserTableRow>({
    columns: createUserColumns(options),
    data: [],
    features: [
      sortingFeature<DataTableSort>({ definitions: userSortDefinitions, initialSorts: initialSorting }),
      filteringFeature({ definitions: userFilterDefinitions }),
      globalSearchFeature({ isFuzzySearchEnabled: false }),
    ],
  });
}

export async function loadUsers(): Promise<UserTableRow[]> {
  const usersQuery = new UsersStore();
  const users: UserTableRow[] = [];
  const seenCursors = new Set<string>();
  let after: string | undefined;

  try {
    while (true) {
      const response = await usersQuery.fetch({
        variables: {
          after,
          first: USER_PAGE_SIZE,
          sortBy: [{ email: { direction: "ASC" } }],
        },
      });

      if (response.errors || !response.data) {
        throw new Error("Could not load users.");
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
  } catch {
    throw new Error("Could not load users.");
  }
}
