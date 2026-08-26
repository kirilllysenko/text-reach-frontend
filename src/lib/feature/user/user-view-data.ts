import type { Role$options } from "$houdini/graphql/enums";

export const userRoleOptions = ["ADMIN", "MANAGER", "EMPLOYEE"] as const satisfies readonly Role$options[];

export const userRoleLabelMap: Record<Role$options, string> = {
  ADMIN: "Admin",
  EMPLOYEE: "Employee",
  MANAGER: "Manager",
};
