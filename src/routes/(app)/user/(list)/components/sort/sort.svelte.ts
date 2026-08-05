import { sortDefinition } from "$lib/components/table";
import type { UserViewModel } from "$lib/feature/user/user-view-data";

export const userSortDefinitions = [
  sortDefinition<"email", UserViewModel>({ sortId: "email", fieldId: "email", label: "Email" }),
  sortDefinition<"name", UserViewModel>({ sortId: "name", fieldId: "name", label: "Name" }),
  sortDefinition<"role", UserViewModel>({
    sortId: "role",
    getValueFn: (user) => user.roleLabel,
    label: "Role",
  }),
];
