import type { ConversationMessagesQuery, ConversationsQuery, MessageDirection, MessageStatus } from "~/gql/graphql";

type ConversationNode = ConversationsQuery["conversations"]["edges"][number]["node"];
type MessageNode = ConversationMessagesQuery["messages"]["edges"][number]["node"];

export interface ConversationViewModel {
  contact: ConversationNode["contact"];
  contactPhoneNumber: string;
  id: string;
  lastMessage: ConversationNode["lastMessage"];
  tenantPhoneNumber: string;
  unreadCount: number;
  updatedAt: string;
}

export interface ChatMessage {
  campaign: MessageNode["campaign"];
  createdAt: string;
  direction: MessageDirection;
  id: string;
  media: MessageNode["media"];
  receivedAt: string | null;
  sentAt: string | null;
  status: MessageStatus;
  text: string;
}

export function toConversationViewModel(conversation: ConversationNode): ConversationViewModel {
  return {
    contact: conversation.contact,
    contactPhoneNumber: conversation.contactPhoneNumber,
    id: conversation.id,
    lastMessage: conversation.lastMessage,
    tenantPhoneNumber: conversation.tenantPhoneNumber,
    unreadCount: conversation.unreadCount,
    updatedAt: conversation.updatedAt,
  };
}

export function toChatMessage(message: MessageNode): ChatMessage {
  return {
    campaign: message.campaign,
    createdAt: message.createdAt,
    direction: message.direction,
    id: message.id,
    media: message.media,
    receivedAt: message.receivedAt,
    sentAt: message.sentAt,
    status: message.status,
    text: message.text,
  };
}

export function conversationTitle(conversation: ConversationViewModel): string {
  const fullName = [conversation.contact.firstName, conversation.contact.lastName]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(" ");
  return fullName || formatPhoneNumber(conversation.contactPhoneNumber);
}

export function conversationInitials(conversation: ConversationViewModel): string {
  const initials = [conversation.contact.firstName, conversation.contact.lastName]
    .filter((value): value is string => Boolean(value?.trim()))
    .map((value) => value.trim().charAt(0).toUpperCase())
    .join("");
  return initials.slice(0, 2) || "#";
}

export function conversationPreview(conversation: ConversationViewModel): string {
  const message = conversation.lastMessage;
  if (!message) return "No messages yet";

  const mediaLabel =
    message.media.length === 0
      ? ""
      : message.media.some((media) => media.contentType.startsWith("image/"))
        ? "Photo"
        : "Attachment";
  const content = message.text.trim() || mediaLabel;
  return message.direction === "OUTBOUND" ? `You: ${content}` : content;
}

export function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  const local = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (local.length !== 10) return value;
  return `(${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`;
}

export function matchesConversation(conversation: ConversationViewModel, search: string): boolean {
  const normalized = search.trim().toLocaleLowerCase();
  if (!normalized) return true;

  return [
    conversationTitle(conversation),
    conversation.contactPhoneNumber,
    conversation.tenantPhoneNumber,
    conversation.lastMessage?.text,
  ].some((value) => value?.toLocaleLowerCase().includes(normalized));
}

export function messageTimestamp(message: ChatMessage): string {
  return message.receivedAt ?? message.sentAt ?? message.createdAt;
}
