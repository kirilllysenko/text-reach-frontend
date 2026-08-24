export function isActiveTenDlcCampaignStatus(status: string | null | undefined): boolean {
  if (!status) return true;
  return ["ACTIVE", "APPROVED", "VERIFIED", "TCR_ACCEPTED"].includes(status?.trim().toUpperCase() ?? "");
}

export function tenDlcStatusLabel(status: string | null | undefined): string {
  if (!status) return "Ready";
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
