import type { CampaignStatus$options } from "$houdini/graphql/enums";

export type CampaignStatus = CampaignStatus$options;

export interface CampaignViewModel {
  id: string;
  name: string;
  messageTemplate: string;
  status: CampaignStatus;
  messageCount: number;
  sentMessageCount: number;
  pendingMessageCount: number;
  contactGroupIds: string[];
}

export const statusLabelMap: Record<NonNullable<CampaignStatus>, string> = {
  PENDING: "Pending",
  SENDING: "Sending",
  PAUSED_BY_USER: "Paused By User",
  PAUSED_BY_BILLING: "Paused By Billing",
  CANCELLED_BY_USER: "Cancelled By User",
  CANCELLED_BY_TIMEOUT: "Cancelled By Timeout",
  SENT: "Sent",
};

export const campaignStatusOptions: NonNullable<CampaignStatus>[] = [
  "PENDING",
  "SENDING",
  "PAUSED_BY_USER",
  "PAUSED_BY_BILLING",
  "CANCELLED_BY_USER",
  "CANCELLED_BY_TIMEOUT",
  "SENT",
];
