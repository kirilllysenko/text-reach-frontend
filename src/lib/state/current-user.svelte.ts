import { getProfile } from "$lib/api/tenant/tenant";
import type { AccessGroup, ProfileDto } from "$lib/api/index.schemas";
import { hasAccess, hasAnyAccess } from "./current-user-access";

class CurrentUserState {
  ready = $state(false);
  user = $state<ProfileDto | null>(null);

  load = async (): Promise<ProfileDto | null> => {
    this.ready = false;

    try {
      const response = await getProfile({ credentials: "include" });
      this.user = response.status === 200 ? response.data : null;
      return this.user;
    } catch {
      this.user = null;
      return null;
    } finally {
      this.ready = true;
    }
  };

  clear = (): void => {
    this.user = null;
    this.ready = false;
  };

  applyProfile = (profile: ProfileDto): void => {
    this.user = profile;
    this.ready = true;
  };

  hasAccess = (accessGroup: AccessGroup): boolean => hasAccess(this.user, accessGroup);

  hasAnyAccess = (accessGroups: readonly AccessGroup[]): boolean => hasAnyAccess(this.user, accessGroups);
}

export const currentUserState = new CurrentUserState();
