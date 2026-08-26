import { containmentFilter } from "text-reach-frontend-library/components/table";
import { userRoleLabelMap } from "$lib/feature/user/user-view-data";
import type { UserTableRow } from "../table/column.svelte";

export const userFilterDefinitions = [
  containmentFilter<"role", UserTableRow>({
    filterId: "role",
    getValueFn: (user) => user.role,
    label: "Role",
    defaultOperator: "IN",
    formatValue: (value) =>
      Array.isArray(value)
        ? value.map((role) => userRoleLabelMap[role as UserTableRow["role"]] ?? role).join(", ")
        : "",
  }),
];
