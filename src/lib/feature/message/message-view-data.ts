import { MessageStatus, SortDirection, type SortDirection as SortDirectionValue } from "$lib/api/index.schemas";

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

export type MessageSortField = "sentAt" | "status" | "tenantPhoneNumber" | "text";

export interface MessageSortRule {
  id: string;
  field: MessageSortField;
  direction: SortDirectionValue;
}

export const messageStatusOptions: MessageStatusValue[] = [
  MessageStatus.PENDING,
  MessageStatus.SENT,
  MessageStatus.FAILED,
];

export const messageStatusLabelMap: Record<MessageStatusValue, string> = {
  [MessageStatus.PENDING]: "Pending",
  [MessageStatus.SENT]: "Sent",
  [MessageStatus.FAILED]: "Failed",
};

export const messageSortFieldOptions: MessageSortField[] = ["sentAt", "status", "tenantPhoneNumber", "text"];

export const messageSortFieldLabelMap: Record<MessageSortField, string> = {
  sentAt: "Sent At",
  status: "Status",
  tenantPhoneNumber: "Tenant Phone",
  text: "Text",
};

export const defaultMessageSortRules: MessageSortRule[] = [
  {
    id: "sentAt",
    field: "sentAt",
    direction: SortDirection.DESC,
  },
];
