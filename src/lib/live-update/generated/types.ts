// Generated from the backend AsyncAPI contract. Do not edit.

export const LIVE_UPDATE_ACTIONS = ["created", "updated", "deleted", "invalidated"] as const;
export type LiveUpdateAction = (typeof LIVE_UPDATE_ACTIONS)[number];

export const LIVE_UPDATE_CHANNELS = [
  "profile",
  "tenant-users",
  "contacts",
  "contact-groups",
  "custom-fields",
  "campaigns",
  "messages",
  "tenant-phones",
  "ten-dlc-brand",
  "ten-dlc-campaigns",
  "topups",
  "wallet",
  "wallet-transactions",
] as const;
export type LiveUpdateChannel = (typeof LIVE_UPDATE_CHANNELS)[number];

export interface ChangeMessage {
  action: LiveUpdateAction;
  channel: LiveUpdateChannel;
  entityId?: string | null;
  eventId: string;
  occurredAt: string;
  type: "change";
}

export interface ErrorMessage {
  code: string;
  message: string;
  requestId?: string | null;
  type: "error";
}

export interface HelloMessage {
  heartbeatIntervalSeconds: number;
  protocolVersion: number;
  type: "hello";
}

export interface SubscribeMessage {
  channels: ReadonlyArray<LiveUpdateChannel>;
  requestId: string;
  type: "subscribe";
}

export interface SubscriptionResultMessage {
  accepted: ReadonlyArray<LiveUpdateChannel>;
  denied: ReadonlyArray<LiveUpdateChannel>;
  requestId: string;
  type: "subscriptionResult";
}

export interface UnsubscribeMessage {
  channels: ReadonlyArray<LiveUpdateChannel>;
  requestId: string;
  type: "unsubscribe";
}

export type LiveUpdateClientMessage = SubscribeMessage | UnsubscribeMessage;
export type LiveUpdateServerMessage = ChangeMessage | ErrorMessage | HelloMessage | SubscriptionResultMessage;
