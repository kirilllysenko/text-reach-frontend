import type { Role } from "~/gql/graphql";

export const userRoleOptions = ["ADMIN", "MANAGER", "EMPLOYEE"] as const satisfies readonly Role[];

export const userRoleLabelMap: Record<Role, string> = {
  ADMIN: "Admin",
  EMPLOYEE: "Employee",
  MANAGER: "Manager",
};
