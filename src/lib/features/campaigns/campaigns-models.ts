import { CampaignDtoStatus, type CampaignDto, type SortDirection } from "$lib/api/index.schemas";

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
  [CampaignDtoStatus.PENDING]: "Pending",
  [CampaignDtoStatus.SENDING]: "Sending",
  [CampaignDtoStatus.PAUSED_BY_USER]: "Paused By User",
  [CampaignDtoStatus.PAUSED_BY_BILLING]: "Paused By Billing",
  [CampaignDtoStatus.CANCELLED_BY_USER]: "Cancelled By User",
  [CampaignDtoStatus.CANCELLED_BY_TIMEOUT]: "Cancelled By Timeout",
  [CampaignDtoStatus.SENT]: "Sent",
};

export const sortFieldLabelMap: Record<CampaignSortField, string> = {
  createdAt: "Created Date",
  name: "Name",
  status: "Status",
  messageCount: "All Messages",
  sentMessageCount: "Sent Messages",
};

export const campaignStatusOptions: NonNullable<CampaignStatus>[] = [
  CampaignDtoStatus.PENDING,
  CampaignDtoStatus.SENDING,
  CampaignDtoStatus.PAUSED_BY_USER,
  CampaignDtoStatus.PAUSED_BY_BILLING,
  CampaignDtoStatus.CANCELLED_BY_USER,
  CampaignDtoStatus.CANCELLED_BY_TIMEOUT,
  CampaignDtoStatus.SENT,
];

export const campaignSortFieldOptions: CampaignSortField[] = [
  "createdAt",
  "name",
  "status",
  "messageCount",
  "sentMessageCount",
];
