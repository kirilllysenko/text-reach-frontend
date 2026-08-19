import type { PhoneType$options } from "$houdini/graphql/enums";

export const phoneTypeLabels: Record<PhoneType$options, string> = {
  SHORT_CODE: "Short code",
  TEN_DLC: "10DLC",
  TOLL_FREE: "Toll-free",
};

export function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  const national = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;

  if (national.length !== 10) {
    return value;
  }

  return `(${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`;
}
