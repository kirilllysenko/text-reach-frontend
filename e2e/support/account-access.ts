export const accessFailureCases = [
  { code: "ACCOUNT_CLOSED", path: "/account-closed" },
  { code: "ACCOUNT_SUSPENDED", path: "/account-suspended" },
  { code: "SESSION_INVALID_USER", path: "/account-unavailable" },
  { code: "TENANT_CLOSED", path: "/account-closed" },
  { code: "TENANT_SUSPENDED", path: "/account-suspended" },
  { code: "TENANT_TRIAL_EXPIRED", path: "/trial-expired" },
  { code: "TRIAL_EXPIRED", path: "/trial-expired" },
] as const;
