import { CampaignStatus as CampaignStatusEnum, type CampaignDto, type CampaignSortDto } from "$lib/api/index.schemas";
import {
  sortDefinition,
  type DataTableSortDefinition,
  type DataTableSortFromDefinitions,
  type DataTableSortIdFromDefinitions,
} from "$lib/components/table";
import type { SortDtoField } from "$lib/utils/table-sort";

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

export const campaignSortDefinitions = [
  sortDefinition({ sortId: "createdAt", label: "Created Date", defaultDirection: "descending" }),
  sortDefinition({ sortId: "name", label: "Name" }),
  sortDefinition({ sortId: "status", label: "Status" }),
  sortDefinition({ sortId: "messageCount", label: "All Messages" }),
  sortDefinition({ sortId: "sentMessageCount", label: "Sent Messages" }),
] as const satisfies readonly DataTableSortDefinition<SortDtoField<CampaignSortDto>>[];

export type CampaignTableSort = DataTableSortFromDefinitions<typeof campaignSortDefinitions>;
export type CampaignSortId = DataTableSortIdFromDefinitions<typeof campaignSortDefinitions>;

export const defaultCampaignSorts = [
  {
    sortId: campaignSortDefinitions[0].sortId,
    direction: campaignSortDefinitions[0].defaultDirection,
  },
] satisfies CampaignTableSort[];
