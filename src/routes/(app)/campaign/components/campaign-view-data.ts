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
  tenantPhoneId: string;
  tenantPhoneNumber: string;
}

export const statusLabelMap: Record<NonNullable<CampaignStatus>, string> = {
  PENDING: "Pending",
  IN_VERIFICATION: "In verification",
  BLOCKED: "Blocked",
  SENDING: "Sending",
  PAUSED_BY_USER: "Paused By User",
  PAUSED_LOW_BALANCE: "Paused: Low Balance",
  CANCELLED_BY_USER: "Cancelled By User",
  CANCELLED_BY_TIMEOUT: "Cancelled By Timeout",
  SENT: "Sent",
};

export const campaignStatusOptions: NonNullable<CampaignStatus>[] = [
  "PENDING",
  "IN_VERIFICATION",
  "BLOCKED",
  "SENDING",
  "PAUSED_BY_USER",
  "PAUSED_LOW_BALANCE",
  "CANCELLED_BY_USER",
  "CANCELLED_BY_TIMEOUT",
  "SENT",
];
