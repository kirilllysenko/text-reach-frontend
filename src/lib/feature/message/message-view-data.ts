import { MessageStatus, type MessageSortDto } from "$lib/api/index.schemas";
import {
  sortDefinition,
  type DataTableSortDefinition,
  type DataTableSortFromDefinitions,
  type DataTableSortIdFromDefinitions,
} from "$lib/components/table";
import type { SortDtoField } from "$lib/utils/table-sort";

export type MessageStatusValue = (typeof MessageStatus)[keyof typeof MessageStatus];

export interface MessageViewModel {
  id: string;
  campaignId: string;
  contactId: string;
  conversationId: string;
  sentAt: string;
  sentAtDisplay: string;
  status: MessageStatusValue;
  statusLabel: string;
  tenantPhoneId: string;
  tenantPhoneNumber: string;
  text: string;
}

export const messageStatusOptions: MessageStatusValue[] = [
  MessageStatus.PENDING,
  MessageStatus.QUEUED,
  MessageStatus.SENT,
  MessageStatus.FAILED,
];

export const messageStatusLabelMap: Record<MessageStatusValue, string> = {
  [MessageStatus.PENDING]: "Pending",
  [MessageStatus.QUEUED]: "Queued",
  [MessageStatus.SENT]: "Sent",
  [MessageStatus.FAILED]: "Failed",
};

export const messageSortDefinitions = [
  sortDefinition({ sortId: "sentAt", label: "Sent At", defaultDirection: "descending" }),
  sortDefinition({ sortId: "status", label: "Status" }),
  sortDefinition({ sortId: "tenantPhoneNumber", label: "Tenant Phone" }),
  sortDefinition({ sortId: "text", label: "Text" }),
] as const satisfies readonly DataTableSortDefinition<SortDtoField<MessageSortDto>>[];

export type MessageTableSort = DataTableSortFromDefinitions<typeof messageSortDefinitions>;
export type MessageSortId = DataTableSortIdFromDefinitions<typeof messageSortDefinitions>;

export const defaultMessageSorts = [
  {
    sortId: messageSortDefinitions[0].sortId,
    direction: messageSortDefinitions[0].defaultDirection,
  },
] satisfies MessageTableSort[];
