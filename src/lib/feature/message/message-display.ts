import type { MessageDto, PageMessageDtoItemsItem } from "$lib/api/index.schemas";
import {
  messageStatusLabelMap,
  type MessageStatusValue,
  type MessageViewModel,
} from "$lib/feature/message/message-view-data";

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatMessageDate(value?: string | null): string {
  if (!value) {
    return "Not sent";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return dateTimeFormatter.format(date);
}

export function toMessageViewModel(message: MessageDto | PageMessageDtoItemsItem): MessageViewModel {
  const status = message.status as MessageStatusValue;

  return {
    id: message.id,
    campaignId: message.campaignId ?? "",
    contactId: message.contactId ?? "",
    conversationId: message.conversationId ?? "",
    sentAt: message.sentAt ?? "",
    sentAtDisplay: formatMessageDate(message.sentAt),
    status,
    statusLabel: messageStatusLabelMap[status],
    tenantPhoneId: message.tenantPhoneId,
    tenantPhoneNumber: message.tenantPhoneNumber,
    text: message.text,
  };
}
