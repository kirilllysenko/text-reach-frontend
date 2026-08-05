import { DatagridCore, type DataTableSort } from "$lib/components/table";
import type { UserViewModel } from "$lib/feature/user/user-view-data";
import { userFilterDefinitions } from "../filter/filter.svelte";
import { userSortDefinitions } from "../sort/sort.svelte";
import { createUserColumns } from "./column.svelte";

const initialSorting = [{ sortId: "email", direction: "ascending" }] satisfies DataTableSort[];

interface UserTableOptions {
  onDelete: (user: UserViewModel) => Promise<boolean>;
}

export function createUserTable(options: UserTableOptions): DatagridCore<UserViewModel> {
  return new DatagridCore<UserViewModel>({
    columns: createUserColumns(options),
    data: [],
    initialState: {
      filtering: {
        filterDefinitions: userFilterDefinitions,
      },
      globalSearch: {
        isFuzzySearchEnabled: false,
      },
      sorting: {
        sortDefinitions: userSortDefinitions,
        sorts: initialSorting,
      },
    },
  });
}
