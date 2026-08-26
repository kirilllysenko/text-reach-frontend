export function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  const national = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (national.length !== 10) return value;
  return `(${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}`;
}

export const phoneTypeLabels = {
  SHORT_CODE: "Short code",
  TEN_DLC: "10DLC",
  TOLL_FREE: "Toll-free",
} as const;

export function isActiveTenDlcCampaignStatus(status: string | null | undefined): boolean {
  if (!status) return true;
  return ["ACTIVE", "APPROVED", "VERIFIED", "TCR_ACCEPTED"].includes(status.trim().toUpperCase());
}

export function tenDlcStatusLabel(status: string | null | undefined): string {
  if (!status) return "Ready";
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
