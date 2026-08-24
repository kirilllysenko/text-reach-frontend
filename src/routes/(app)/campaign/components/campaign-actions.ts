import type { CampaignStatus } from "./campaign-view-data";

export type CampaignAction = "pause" | "resume" | "cancel";

const pauseStatuses: CampaignStatus[] = ["SCHEDULED", "PENDING", "SENDING"];
const resumeStatuses: CampaignStatus[] = ["PAUSED_BY_USER", "PAUSED_LOW_BALANCE"];
const cancelStatuses: CampaignStatus[] = [...pauseStatuses, ...resumeStatuses];

export function getCampaignActions(status: CampaignStatus): CampaignAction[] {
  const actions: CampaignAction[] = [];

  if (pauseStatuses.includes(status)) {
    actions.push("pause");
  }

  if (resumeStatuses.includes(status)) {
    actions.push("resume");
  }

  if (cancelStatuses.includes(status)) {
    actions.push("cancel");
  }

  return actions;
}
