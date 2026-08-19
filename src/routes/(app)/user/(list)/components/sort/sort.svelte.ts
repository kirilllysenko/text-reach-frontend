import { sortDefinition } from "text-reach-frontend-library/components/table";
import { userRoleLabelMap } from "$lib/feature/user/user-view-data";
import type { UserTableRow } from "../table/column.svelte";

export const userSortDefinitions = [
  sortDefinition<"email", UserTableRow>({ sortId: "email", fieldId: "email", label: "Email" }),
  sortDefinition<"name", UserTableRow>({
    sortId: "name",
    getValueFn: (user) => user.name?.trim() || "Unnamed user",
    label: "Name",
  }),
  sortDefinition<"role", UserTableRow>({
    sortId: "role",
    getValueFn: (user) => userRoleLabelMap[user.role],
    label: "Role",
  }),
];
