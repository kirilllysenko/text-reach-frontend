import { CampaignStatus as CampaignStatusEnum, type CampaignDto } from "$lib/api/index.schemas";

export type CampaignStatus = CampaignDto["status"];

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
  [CampaignStatusEnum.PENDING]: "Pending",
  [CampaignStatusEnum.SENDING]: "Sending",
  [CampaignStatusEnum.PAUSED_BY_USER]: "Paused By User",
  [CampaignStatusEnum.PAUSED_BY_BILLING]: "Paused By Billing",
  [CampaignStatusEnum.CANCELLED_BY_USER]: "Cancelled By User",
  [CampaignStatusEnum.CANCELLED_BY_TIMEOUT]: "Cancelled By Timeout",
  [CampaignStatusEnum.SENT]: "Sent",
};

export const campaignStatusOptions: NonNullable<CampaignStatus>[] = [
  CampaignStatusEnum.PENDING,
  CampaignStatusEnum.SENDING,
  CampaignStatusEnum.PAUSED_BY_USER,
  CampaignStatusEnum.PAUSED_BY_BILLING,
  CampaignStatusEnum.CANCELLED_BY_USER,
  CampaignStatusEnum.CANCELLED_BY_TIMEOUT,
  CampaignStatusEnum.SENT,
];
