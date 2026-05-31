import { goto } from "$app/navigation";
import { PATH_SIGN_IN } from "$lib/app/paths";
import type { ErrorCode, ProfileDto } from "$lib/api/index.schemas";
import { checkSession, signOut } from "$lib/api/auth/auth";
import { getProfile } from "$lib/api/tenant/tenant";

function buildSignInHref(errorCode?: ErrorCode): string {
  if (!errorCode) {
    return PATH_SIGN_IN;
  }

  const searchParams = new URLSearchParams({ sessionError: errorCode });
  return `${PATH_SIGN_IN}?${searchParams.toString()}`;
}

class SessionState {
  ready = $state(false);
  profile = $state<ProfileDto | null>(null);

  ensureAppAccess = async (): Promise<boolean> => {
    this.ready = false;
    let response;

    try {
      response = await checkSession({ credentials: "include" });
    } catch {
      this.profile = null;
      await goto(PATH_SIGN_IN);
      return false;
    }

    if (response.status === 200) {
      this.ready = true;
      return true;
    }

    this.profile = null;
    await goto(buildSignInHref(response.data?.errorCode));
    return false;
  };

  loadProfile = async (): Promise<ProfileDto | null> => {
    const response = await getProfile({ credentials: "include" });
    if (response.status !== 200) {
      return null;
    }

    this.profile = response.data;
    return response.data;
  };

  applyProfile = (profile: ProfileDto): void => {
    this.profile = profile;
  };

  signOutAndRedirect = async (): Promise<void> => {
    await signOut({ credentials: "include" });
    this.profile = null;
    this.ready = false;
    await goto(PATH_SIGN_IN);
  };
}

export const sessionState = new SessionState();
