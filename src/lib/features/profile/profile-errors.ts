import type { ErrorResponseDto } from "$lib/api/index.schemas";

export function setProfileResponseErrors(
  error: ErrorResponseDto | undefined,
  fieldSetters: Record<string, (value: string | null) => void>,
  setGeneralError: (value: string | null) => void,
): void {
  let hasFieldErrors = false;

  for (const [field, setError] of Object.entries(fieldSetters)) {
    setError(null);
    const fieldError = error?.fields?.find((item) => item.field === field);
    if (!fieldError) {
      continue;
    }

    hasFieldErrors = true;
    setError(fieldError.errorDescription);
  }

  setGeneralError(hasFieldErrors ? null : (error?.errorDescription ?? null));
}
