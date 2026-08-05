import { containmentFilter } from "$lib/components/table";
import { userRoleLabelMap, type UserViewModel } from "$lib/feature/user/user-view-data";

export const userFilterDefinitions = [
  containmentFilter<"role", UserViewModel>({
    filterId: "role",
    getValueFn: (user) => user.role,
    label: "Role",
    defaultOperator: "IN",
    formatValue: (value) =>
      Array.isArray(value)
        ? value.map((role) => userRoleLabelMap[role as UserViewModel["role"]] ?? role).join(", ")
        : "",
  }),
];
