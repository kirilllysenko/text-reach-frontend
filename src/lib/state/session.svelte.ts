import { goto } from "$app/navigation";
import { CheckSessionStore, ProfileStore, SignOutStore } from "$houdini";
import { PATH_SIGN_IN } from "$lib/app/paths";
import type { ApiErrorCode } from "$lib/form/errors";
import { graphQLErrorCode } from "$lib/graphql/errors";

export interface ProfileData {
  accessGroups: string[];
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
      this.profile = null;
      await goto(PATH_SIGN_IN);
      return false;
    }

    if (!response.errors && response.data?.checkSession) {
      this.ready = true;
      return true;
    }

    this.profile = null;
    await goto(buildSignInHref(graphQLErrorCode(response.errors)));
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

  signOutAndRedirect = async (): Promise<void> => {
    await this.signOutMutation.mutate(undefined);
    this.profile = null;
    this.ready = false;
    await goto(PATH_SIGN_IN);
  };
}

export const sessionState = new SessionState();
