import type { Role$options } from "$houdini/graphql/enums";

export interface UserViewModel {
  id: string;
  email: string;
  name: string;
  role: Role$options;
  roleLabel: string;
}

export interface UserDtoLike {
  readonly email: string;
  readonly id: string;
  readonly name?: string | null;
  readonly role: Role$options;
}

export const userRoleOptions = ["ADMIN", "MANAGER", "EMPLOYEE"] as const satisfies readonly Role$options[];

export const userRoleLabelMap: Record<Role$options, string> = {
  ADMIN: "Admin",
  EMPLOYEE: "Employee",
  MANAGER: "Manager",
};
