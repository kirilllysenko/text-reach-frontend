import type { AccessGroup, ProfileDto } from "$lib/api/index.schemas";

export function hasAccess(user: Pick<ProfileDto, "accessGroups"> | null, accessGroup: AccessGroup): boolean {
  return user?.accessGroups.includes(accessGroup) ?? false;
}

export function hasAnyAccess(
  user: Pick<ProfileDto, "accessGroups"> | null,
  accessGroups: readonly AccessGroup[],
): boolean {
  return accessGroups.some((accessGroup) => hasAccess(user, accessGroup));
}
