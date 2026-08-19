import type { MessageStatus$options } from "$houdini/graphql/enums";

export type MessageStatusValue = MessageStatus$options;

export const messageStatusOptions: MessageStatusValue[] = [
  "PENDING",
  "IN_VERIFICATION",
  "BLOCKED",
  "QUEUED",
  "SENT",
  "RECEIVED",
  "FAILED",
];

export const messageStatusLabelMap: Record<MessageStatusValue, string> = {
  PENDING: "Pending",
  IN_VERIFICATION: "In verification",
  BLOCKED: "Blocked",
  QUEUED: "Queued",
  RECEIVED: "Received",
  SENT: "Sent",
  FAILED: "Failed",
};
