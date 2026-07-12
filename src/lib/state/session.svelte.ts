import { goto } from "$app/navigation";
import { PATH_SIGN_IN } from "$lib/app/paths";
import type { ErrorCode } from "$lib/api/index.schemas";
import { checkSession, signOut } from "$lib/api/auth/auth";
import { currentUserState } from "$lib/state/current-user.svelte";

function buildSignInHref(errorCode?: ErrorCode): string {
  if (!errorCode) {
    return PATH_SIGN_IN;
  }

  const searchParams = new URLSearchParams({ sessionError: errorCode });
  return `${PATH_SIGN_IN}?${searchParams.toString()}`;
}

class SessionState {
  ready = $state(false);

  ensureAppAccess = async (): Promise<boolean> => {
    this.ready = false;
    let response;

    try {
      response = await checkSession({ credentials: "include" });
    } catch {
      currentUserState.clear();
      await goto(PATH_SIGN_IN);
      return false;
    }

    if (response.status === 200) {
      this.ready = true;
      return true;
    }

    currentUserState.clear();
    await goto(buildSignInHref(response.data?.errorCode));
    return false;
  };

  signOutAndRedirect = async (): Promise<void> => {
    await signOut({ credentials: "include" });
    currentUserState.clear();
    this.ready = false;
    await goto(PATH_SIGN_IN);
  };
}

export const sessionState = new SessionState();
