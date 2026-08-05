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

interface MessageDtoLike {
  campaign?: { id: string } | null;
  contact?: { id: string } | null;
  conversation?: { id: string } | null;
  id: string;
  sentAt?: string | null;
  status: MessageStatusValue;
  tenantPhone: { id: string };
  tenantPhoneNumber: string;
  text: string;
}

export function toMessageViewModel(message: MessageDtoLike): MessageViewModel {
  const status = message.status as MessageStatusValue;

  return {
    id: message.id,
    campaignId: message.campaign?.id ?? "",
    contactId: message.contact?.id ?? "",
    conversationId: message.conversation?.id ?? "",
    sentAt: message.sentAt ?? "",
    sentAtDisplay: formatMessageDate(message.sentAt),
    status,
    statusLabel: messageStatusLabelMap[status],
    tenantPhoneId: message.tenantPhone.id,
    tenantPhoneNumber: message.tenantPhoneNumber,
    text: message.text,
  };
}
