export type ApiErrorCode =
  | "ACCOUNT_ALREADY_EXISTS"
  | "INTERNAL_ERROR"
  | "INVALID_VALUE"
  | "NOT_FOUND"
  | "SESSION_CLIENT_CHANGED"
  | "SESSION_EXPIRED"
  | "SESSION_INVALID_USER"
  | "TRIAL_EXPIRED"
  | "TENANT_TRIAL_EXPIRED"
  | "ACCOUNT_SUSPENDED"
  | "TENANT_SUSPENDED"
  | "ACCOUNT_CLOSED"
  | "TENANT_CLOSED"
  | "TEN_DLC_BRAND_REQUIRED"
  | "TOO_MANY_EMAIL_CODE_REQUESTS"
  | "TOO_MANY_PHONE_CODE_REQUESTS"
  | "VALUE_REQUIRED"
  | (string & {});

export const defaultErrorText = "Something went wrong. Please try again.";
export const networkErrorText = "Please check your internet connection and try again.";
export const notFoundErrorText =
  "The changes could not be made because some data was not found. Please refresh the page.";

const errorTextByCode: Partial<Record<ApiErrorCode, string>> = {
  VALUE_REQUIRED: "Required",
  INVALID_VALUE: "The entered value is invalid.",
  INTERNAL_ERROR: defaultErrorText,
  NOT_FOUND: notFoundErrorText,
  ACCOUNT_ALREADY_EXISTS: "An account with these details already exists.",
  TOO_MANY_EMAIL_CODE_REQUESTS: "Too many email code requests. Please wait before trying again.",
  TOO_MANY_PHONE_CODE_REQUESTS: "Too many phone code requests. Please wait before trying again.",
  SESSION_EXPIRED: "Your session has expired. Please sign in again.",
  SESSION_CLIENT_CHANGED: "Your browser or internet connection settings changed. Please sign in again.",
  SESSION_INVALID_USER: "Your session is no longer valid. Please sign in again.",
  TRIAL_EXPIRED: "Your free trial has ended.",
  TENANT_TRIAL_EXPIRED: "Your free trial has ended.",
  ACCOUNT_SUSPENDED: "This account is suspended.",
  TENANT_SUSPENDED: "This account is suspended.",
  ACCOUNT_CLOSED: "This account is closed.",
  TENANT_CLOSED: "This account is closed.",
  TEN_DLC_BRAND_REQUIRED: "A 10DLC brand is required for this action.",
};

export function toErrorText(code?: ApiErrorCode): string {
  if (!code) {
    return defaultErrorText;
  }

  return errorTextByCode[code] ?? defaultErrorText;
}
