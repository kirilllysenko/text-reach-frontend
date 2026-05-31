import type { ErrorResponse } from "$lib/api/index.schemas";

export function setProfileResponseErrors(
  error: ErrorResponse | undefined,
  fieldSetters: Record<string, (value: string | null) => void>,
  setGeneralError: (value: string | null) => void,
): void {
  for (const [field, setError] of Object.entries(fieldSetters)) {
    setError(null);
  }

  setGeneralError(error?.errorDescription ?? null);
}
