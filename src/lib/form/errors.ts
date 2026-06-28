import type { ErrorCode } from "$lib/api/index.schemas";

type ApiErrorCode = ErrorCode;

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
  TEN_DLC_BRAND_REQUIRED: "A 10DLC brand is required for this action.",
};

export function toErrorText(code?: ApiErrorCode): string {
  if (!code) {
    return defaultErrorText;
  }

  return errorTextByCode[code] ?? defaultErrorText;
}
