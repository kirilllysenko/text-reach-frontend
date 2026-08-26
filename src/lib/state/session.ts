import { createStore } from "~/lib/state/store";
import {
  CheckSessionDocument,
  ProfileDocument,
  SignOutDocument,
  TenantLifecycleDocument,
  type AccessGroup,
  type ProfileQuery,
  type TenantLifecycleQuery,
} from "~/gql/graphql";
import { PATH_SIGN_IN } from "~/lib/app/paths";
import { accessFailurePath } from "~/lib/feature/account-access/access-failure";
import type { ApiErrorCode } from "~/lib/form/errors";
import { graphqlClient } from "~/lib/graphql/client";
import { graphQLErrorCode } from "~/lib/graphql/errors";
import { resetPhoneFilter } from "~/lib/state/phone-filter";

type Navigate = (to: string, options?: { replace?: boolean }) => void;
type ProfileData = NonNullable<ProfileQuery["profile"]>;
type TenantLifecycleData = NonNullable<TenantLifecycleQuery["tenantLifecycle"]>;

interface SessionStore {
  ready: boolean;
  profile: ProfileData | null;
  tenantLifecycle: TenantLifecycleData | null;
}

export const [session, setSession] = createStore<SessionStore>({
  ready: false,
  profile: null,
  tenantLifecycle: null,
});

function buildSignInHref(errorCode?: ApiErrorCode): string {
  if (!errorCode) return PATH_SIGN_IN;
  return `${PATH_SIGN_IN}?${new URLSearchParams({ sessionError: errorCode }).toString()}`;
}

function clearSession(): void {
  resetPhoneFilter();
  setSession({ ready: false, profile: null, tenantLifecycle: null });
}

export async function ensureAppAccess(navigate: Navigate): Promise<boolean> {
  if (session.ready) return true;
  setSession("ready", false);

  try {
    const response = await graphqlClient.query(CheckSessionDocument, {}, { requestPolicy: "network-only" });
    if (!response.error && response.data?.checkSession) {
      setSession("ready", true);
      return true;
    }

    clearSession();
    const errorCode = graphQLErrorCode(response.error);
    navigate(accessFailurePath(errorCode) ?? buildSignInHref(errorCode), { replace: true });
  } catch {
    clearSession();
    navigate(PATH_SIGN_IN, { replace: true });
  }
  return false;
}

export async function loadProfile(): Promise<ProfileData | null> {
  const response = await graphqlClient.query(ProfileDocument, {}, { requestPolicy: "network-only" });
  const profile = !response.error && response.data?.profile ? response.data.profile : null;
  setSession("profile", profile);
  return profile;
}

export async function loadTenantLifecycle(): Promise<TenantLifecycleData | null> {
  try {
    const response = await graphqlClient.query(TenantLifecycleDocument, {}, { requestPolicy: "network-only" });
    const lifecycle = !response.error && response.data?.tenantLifecycle ? response.data.tenantLifecycle : null;
    setSession("tenantLifecycle", lifecycle);
    return lifecycle;
  } catch {
    setSession("tenantLifecycle", null);
    return null;
  }
}

export function hasAccess(accessGroup: AccessGroup): boolean {
  return session.profile?.accessGroups.includes(accessGroup) ?? false;
}

export function applyProfile(profile: ProfileData): void {
  setSession("profile", profile);
}

export async function signOutAndRedirect(navigate: Navigate): Promise<void> {
  try {
    await graphqlClient.mutation(SignOutDocument, {});
  } finally {
    clearSession();
    navigate(PATH_SIGN_IN, { replace: true });
  }
}
