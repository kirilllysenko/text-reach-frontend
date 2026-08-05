import type { MessageStatus$options, SortDirection$options } from "$houdini/graphql/enums";

export type MessageStatusValue = MessageStatus$options;

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
  direction: SortDirection$options;
}

export const messageStatusOptions: MessageStatusValue[] = ["PENDING", "QUEUED", "SENT", "FAILED"];

export const messageStatusLabelMap: Record<MessageStatusValue, string> = {
  PENDING: "Pending",
  QUEUED: "Queued",
  SENT: "Sent",
  FAILED: "Failed",
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
    direction: "DESC",
  },
];
