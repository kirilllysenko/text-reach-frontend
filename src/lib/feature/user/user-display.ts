import { userRoleLabelMap, type UserDtoLike, type UserViewModel } from "./user-view-data";

export function toUserViewModel(user: UserDtoLike): UserViewModel {
  return {
    id: user.id,
    email: user.email,
    name: user.name?.trim() || "Unnamed user",
    role: user.role,
    roleLabel: userRoleLabelMap[user.role],
  };
}
