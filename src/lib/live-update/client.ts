export type LiveUpdateChannel =
  | "profile"
  | "tenant-users"
  | "contacts"
  | "contact-groups"
  | "custom-fields"
  | "campaigns"
  | "messages"
  | "conversations"
  | "tenant-phones"
  | "ten-dlc-brand"
  | "ten-dlc-campaigns"
  | "topups"
  | "wallet"
  | "wallet-transactions";

export type LiveUpdateServerMessage =
  | {
      action: string;
      channel: LiveUpdateChannel;
      entityId?: string | null;
      eventId: string;
      occurredAt: string;
      type: "change";
    }
  | { code: string; message: string; requestId?: string | null; type: "error" }
  | { heartbeatIntervalSeconds: number; protocolVersion: number; type: "hello" }
  | { accepted: LiveUpdateChannel[]; denied: LiveUpdateChannel[]; requestId: string; type: "subscriptionResult" };

interface LiveUpdateClientOptions {
  onClose?: () => void;
  onMessage: (message: LiveUpdateServerMessage) => void;
  onOpen?: () => void;
  url: string;
}

export interface LiveUpdateClient {
  connect(): void;
  disconnect(code?: number, reason?: string): void;
  readonly readyState: number;
  subscribe(channels: readonly LiveUpdateChannel[], requestId?: string): string;
}

export function createLiveUpdateClient(options: LiveUpdateClientOptions): LiveUpdateClient {
  let socket: WebSocket | undefined;
  return {
    connect() {
      if (socket && socket.readyState < 2) return;
      socket = new WebSocket(options.url);
      socket.onopen = () => options.onOpen?.();
      socket.onclose = () => options.onClose?.();
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(String(event.data)) as unknown;
          if (isServerMessage(message)) options.onMessage(message);
        } catch {
          // Invalid messages are ignored; the next valid event or reconnect restores the snapshot.
        }
      };
    },
    disconnect(code, reason) {
      socket?.close(code, reason);
      socket = undefined;
    },
    get readyState() {
      return socket?.readyState ?? WebSocket.CLOSED;
    },
    subscribe(channels, requestId = createRequestId()) {
      if (!socket || socket.readyState !== WebSocket.OPEN) throw new Error("Live-update WebSocket is not open");
      socket.send(JSON.stringify({ type: "subscribe", requestId, channels }));
      return requestId;
    },
  };
}

function isServerMessage(value: unknown): value is LiveUpdateServerMessage {
  if (!value || typeof value !== "object" || !("type" in value)) return false;
  return ["change", "error", "hello", "subscriptionResult"].includes(String(value.type));
}

function createRequestId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `live-update-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
