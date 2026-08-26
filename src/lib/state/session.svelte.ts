import { goto } from "$app/navigation";
import { CheckSessionStore, ProfileStore, SignOutStore, TenantLifecycleStore } from "$houdini";
import type {
  AccessGroup$options,
  TenantLifecycleAccessMode$options,
  TenantLifecycleAccountStatus$options,
  TenantLifecycleBusinessVerification$options,
} from "$houdini/graphql/enums";
import { PATH_SIGN_IN } from "$lib/app/paths";
import { accessFailurePath } from "$lib/feature/account-access/access-failure";
import type { ApiErrorCode } from "$lib/form/errors";
import { graphQLErrorCode } from "$lib/graphql/errors";
import type { PhoneFilterState } from "$lib/state/phone-filter.svelte";
import { createContext } from "svelte";

export interface ProfileData {
  accessGroups: AccessGroup$options[];
  email: string;
  name?: string | null;
}

export interface TenantLifecycleData {
  accessMode: TenantLifecycleAccessMode$options;
  accountStatus: TenantLifecycleAccountStatus$options;
  businessVerification: TenantLifecycleBusinessVerification$options;
  trialEndsAt: string;
}

function buildSignInHref(errorCode?: ApiErrorCode): string {
  if (!errorCode) {
    return PATH_SIGN_IN;
  }

  const searchParams = new URLSearchParams({ sessionError: errorCode });
  return `${PATH_SIGN_IN}?${searchParams.toString()}`;
}

export function createSessionState(phoneFilter: PhoneFilterState) {
  const checkSessionQuery = new CheckSessionStore();
  const profileQuery = new ProfileStore();
  const tenantLifecycleQuery = new TenantLifecycleStore();
  const signOutMutation = new SignOutStore();
  const state = $state({
    ready: false,
    profile: null as ProfileData | null,
    tenantLifecycle: null as TenantLifecycleData | null,
  });

  function clear(): void {
    phoneFilter.reset();
    state.ready = false;
    state.profile = null;
    state.tenantLifecycle = null;
  }

  async function ensureAppAccess(): Promise<boolean> {
    state.ready = false;
    let response;

    try {
      response = await checkSessionQuery.fetch();
    } catch {
      clear();
      await goto(PATH_SIGN_IN);
      return false;
    }

    if (!response.errors && response.data?.checkSession) {
      state.ready = true;
      return true;
    }

    clear();
    const errorCode = graphQLErrorCode(response.errors);
    await goto(accessFailurePath(errorCode) ?? buildSignInHref(errorCode));
    return false;
  }

  async function loadProfile(): Promise<ProfileData | null> {
    const response = await profileQuery.fetch();
    if (response.errors || !response.data?.profile) {
      return null;
    }

    state.profile = response.data.profile;
    return response.data.profile;
  }

  async function loadTenantLifecycle(): Promise<TenantLifecycleData | null> {
    try {
      const response = await tenantLifecycleQuery.fetch();
      if (response.errors || !response.data?.tenantLifecycle) {
        state.tenantLifecycle = null;
        return null;
      }

      state.tenantLifecycle = response.data.tenantLifecycle;
      return response.data.tenantLifecycle;
    } catch {
      state.tenantLifecycle = null;
      return null;
    }
  }

  async function signOutAndRedirect(): Promise<void> {
    await signOutMutation.mutate(undefined);
    clear();
    await goto(PATH_SIGN_IN);
  }

  return {
    get ready() {
      return state.ready;
    },
    get profile() {
      return state.profile;
    },
    get tenantLifecycle() {
      return state.tenantLifecycle;
    },
    ensureAppAccess,
    loadProfile,
    loadTenantLifecycle,
    applyProfile(profile: ProfileData): void {
      state.profile = profile;
    },
    hasAccess(accessGroup: AccessGroup$options): boolean {
      return state.profile?.accessGroups.includes(accessGroup) ?? false;
    },
    signOutAndRedirect,
  };
}

export type SessionState = ReturnType<typeof createSessionState>;
export const [getSessionState, setSessionState] = createContext<SessionState>();
