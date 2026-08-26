import type { CampaignStatus, CampaignsQuery } from "~/gql/graphql";

type CampaignNode = CampaignsQuery["campaigns"]["edges"][number]["node"];

export interface CampaignViewModel {
  contactGroupIds: string[];
  id: string;
  messageCount: number;
  messageTemplate: string;
  name: string;
  pendingMessageCount: number;
  scheduledAt: string | null;
  sentMessageCount: number;
  status: CampaignStatus;
  tenantPhoneId: string;
  tenantPhoneNumber: string;
}

export const statusLabelMap: Record<CampaignStatus, string> = {
  BLOCKED: "Blocked",
  CANCELLED_BY_TIMEOUT: "Cancelled by timeout",
  CANCELLED_BY_USER: "Cancelled by user",
  IN_VERIFICATION: "In verification",
  PAUSED_BY_USER: "Paused by user",
  PAUSED_LOW_BALANCE: "Paused: low balance",
  PENDING: "Pending",
  SCHEDULED: "Scheduled",
  SENDING: "Sending",
  SENT: "Sent",
};

export const campaignStatusOptions = Object.keys(statusLabelMap) as CampaignStatus[];

export function toCampaignViewModel(campaign: CampaignNode): CampaignViewModel {
  const messageCount = Math.max(campaign.messageCount, campaign.sentMessageCount);
  const sentMessageCount = Math.min(Math.max(campaign.sentMessageCount, 0), messageCount);
  return {
    contactGroupIds: campaign.contactGroups.map((group) => group.id),
    id: campaign.id,
    messageCount,
    messageTemplate: campaign.messageTemplate,
    name: campaign.name,
    pendingMessageCount: Math.max(messageCount - sentMessageCount, 0),
    scheduledAt: campaign.scheduledAt,
    sentMessageCount,
    status: campaign.status,
    tenantPhoneId: campaign.tenantPhone.id,
    tenantPhoneNumber: campaign.tenantPhone.phoneNumber,
  };
}

export function mergeCampaignGroupNames(
  current: Record<string, string>,
  groups: readonly { id: string; name: string }[],
): Record<string, string> {
  const next = { ...current };
  for (const group of groups) next[group.id] = group.name;
  return next;
}

export function formatCampaignSchedule(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export type CampaignAction = "pause" | "resume" | "cancel";

export function getCampaignActions(status: CampaignStatus): CampaignAction[] {
  const pauseStatuses: CampaignStatus[] = ["SCHEDULED", "PENDING", "SENDING"];
  const resumeStatuses: CampaignStatus[] = ["PAUSED_BY_USER", "PAUSED_LOW_BALANCE"];
  const actions: CampaignAction[] = [];
  if (pauseStatuses.includes(status)) actions.push("pause");
  if (resumeStatuses.includes(status)) actions.push("resume");
  if ([...pauseStatuses, ...resumeStatuses].includes(status)) actions.push("cancel");
  return actions;
}
