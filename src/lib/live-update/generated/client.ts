// Generated from the backend AsyncAPI contract. Do not edit.

import type { LiveUpdateChannel, LiveUpdateClientMessage, LiveUpdateServerMessage } from "./types";
import { parseLiveUpdateServerMessage } from "./validators";

export interface LiveUpdateClientOptions {
  url: string;
  protocols?: string | string[];
  onMessage: (message: LiveUpdateServerMessage) => void;
  onInvalidMessage?: (error: unknown, event: MessageEvent) => void;
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  webSocketFactory?: (url: string, protocols?: string | string[]) => WebSocket;
}

export interface LiveUpdateClient {
  connect(): void;
  disconnect(code?: number, reason?: string): void;
  subscribe(channels: readonly LiveUpdateChannel[], requestId?: string): string;
  unsubscribe(channels: readonly LiveUpdateChannel[], requestId?: string): string;
  readonly readyState: number;
}

export function createLiveUpdateClient(options: LiveUpdateClientOptions): LiveUpdateClient {
  let socket: WebSocket | undefined;
  const factory = options.webSocketFactory ?? ((url, protocols) => new WebSocket(url, protocols));

  function send(message: LiveUpdateClientMessage): void {
    if (!socket || socket.readyState !== 1) throw new Error("Live-update WebSocket is not open");
    socket.send(JSON.stringify(message));
  }

  function command(
    type: "subscribe" | "unsubscribe",
    channels: readonly LiveUpdateChannel[],
    requestId?: string,
  ): string {
    const id = requestId ?? createRequestId();
    send({ type, requestId: id, channels: [...channels] });
    return id;
  }

  return {
    connect() {
      if (socket && (socket.readyState === 0 || socket.readyState === 1)) return;
      socket = factory(options.url, options.protocols);
      socket.onopen = (event) => options.onOpen?.(event);
      socket.onclose = (event) => options.onClose?.(event);
      socket.onmessage = (event) => {
        try {
          options.onMessage(parseLiveUpdateServerMessage(event.data));
        } catch (error) {
          options.onInvalidMessage?.(error, event);
        }
      };
    },
    disconnect(code, reason) {
      socket?.close(code, reason);
      socket = undefined;
    },
    subscribe: (channels, requestId) => command("subscribe", channels, requestId),
    unsubscribe: (channels, requestId) => command("unsubscribe", channels, requestId),
    get readyState() {
      return socket?.readyState ?? 3;
    },
  };
}

function createRequestId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `live-update-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
