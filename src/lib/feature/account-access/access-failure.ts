import {
  PATH_ACCOUNT_CLOSED,
  PATH_ACCOUNT_SUSPENDED,
  PATH_ACCOUNT_UNAVAILABLE,
  PATH_TRIAL_EXPIRED,
} from "$lib/app/paths";

type AccessFailurePath =
  | typeof PATH_ACCOUNT_CLOSED
  | typeof PATH_ACCOUNT_SUSPENDED
  | typeof PATH_ACCOUNT_UNAVAILABLE
  | typeof PATH_TRIAL_EXPIRED;

const accessFailurePathByCode: Readonly<Record<string, AccessFailurePath>> = {
  ACCOUNT_CLOSED: PATH_ACCOUNT_CLOSED,
  ACCOUNT_SUSPENDED: PATH_ACCOUNT_SUSPENDED,
  SESSION_INVALID_USER: PATH_ACCOUNT_UNAVAILABLE,
  TENANT_CLOSED: PATH_ACCOUNT_CLOSED,
  TENANT_SUSPENDED: PATH_ACCOUNT_SUSPENDED,
  TENANT_TRIAL_EXPIRED: PATH_TRIAL_EXPIRED,
  TRIAL_EXPIRED: PATH_TRIAL_EXPIRED,
};

export function accessFailurePath(errorCode?: string): AccessFailurePath | null {
  if (!errorCode) {
    return null;
  }

  return accessFailurePathByCode[errorCode] ?? null;
}
