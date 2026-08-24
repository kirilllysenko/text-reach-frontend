import { goto } from "$app/navigation";
import { CheckSessionStore, ProfileStore, SignOutStore } from "$houdini";
import type { AccessGroup$options } from "$houdini/graphql/enums";
import { PATH_SIGN_IN } from "$lib/app/paths";
import { accessFailurePath } from "$lib/feature/account-access/access-failure";
import type { ApiErrorCode } from "$lib/form/errors";
import { graphQLErrorCode } from "$lib/graphql/errors";
import { phoneFilterState } from "$lib/state/phone-filter.svelte";

export interface ProfileData {
  accessGroups: AccessGroup$options[];
  email: string;
  name?: string | null;
}

function buildSignInHref(errorCode?: ApiErrorCode): string {
  if (!errorCode) {
    return PATH_SIGN_IN;
  }

  const searchParams = new URLSearchParams({ sessionError: errorCode });
  return `${PATH_SIGN_IN}?${searchParams.toString()}`;
}

class SessionState {
  private readonly checkSessionQuery = new CheckSessionStore();
  private readonly profileQuery = new ProfileStore();
  private readonly signOutMutation = new SignOutStore();
  ready = $state(false);
  profile = $state<ProfileData | null>(null);

  ensureAppAccess = async (): Promise<boolean> => {
    this.ready = false;
    let response;

    try {
      response = await this.checkSessionQuery.fetch();
    } catch {
      phoneFilterState.reset();
      this.profile = null;
      await goto(PATH_SIGN_IN);
      return false;
    }

    if (!response.errors && response.data?.checkSession) {
      this.ready = true;
      return true;
    }

    phoneFilterState.reset();
    this.profile = null;
    const errorCode = graphQLErrorCode(response.errors);
    await goto(accessFailurePath(errorCode) ?? buildSignInHref(errorCode));
    return false;
  };

  loadProfile = async (): Promise<ProfileData | null> => {
    const response = await this.profileQuery.fetch();
    if (response.errors || !response.data?.profile) {
      return null;
    }

    this.profile = response.data.profile;
    return response.data.profile;
  };

  applyProfile = (profile: ProfileData): void => {
    this.profile = profile;
  };

  hasAccess = (accessGroup: AccessGroup$options): boolean => {
    return this.profile?.accessGroups.includes(accessGroup) ?? false;
  };

  signOutAndRedirect = async (): Promise<void> => {
    await this.signOutMutation.mutate(undefined);
    phoneFilterState.reset();
    this.profile = null;
    this.ready = false;
    await goto(PATH_SIGN_IN);
  };
}

export const sessionState = new SessionState();
