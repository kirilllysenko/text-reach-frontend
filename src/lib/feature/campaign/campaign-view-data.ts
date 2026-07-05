import { CampaignStatus as CampaignStatusEnum, type CampaignDto, type SortDirection } from "$lib/api/index.schemas";

export type CampaignStatus = CampaignDto["status"];

export interface CampaignViewModel {
  id: string;
  name: string;
  messageTemplate: string;
  status: CampaignStatus;
  messageCount: number;
  sentMessageCount: number;
  pendingMessageCount: number;
  errorMessageCount: number;
  createdAt: Date;
  contactGroupIds: string[];
  fromPhoneNumber: string;
}

export type CampaignSortField = "createdAt" | "name" | "status" | "messageCount" | "sentMessageCount";

export interface SortRule {
  id: string;
  field: CampaignSortField;
  direction: SortDirection;
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

export const sortFieldLabelMap: Record<CampaignSortField, string> = {
  createdAt: "Created Date",
  name: "Name",
  status: "Status",
  messageCount: "All Messages",
  sentMessageCount: "Sent Messages",
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

export const campaignSortFieldOptions: CampaignSortField[] = [
  "createdAt",
  "name",
  "status",
  "messageCount",
  "sentMessageCount",
];
