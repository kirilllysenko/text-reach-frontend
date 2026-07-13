import { describe, expect, it, vi } from "vitest";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";
import {
  LIVE_UPDATE_ACTIONS,
  LIVE_UPDATE_CHANNELS,
  createLiveUpdateClient,
  isLiveUpdateServerMessage,
} from "./generated";

describe("generated live-update contract", () => {
  it("exports the contract channel and action literals", () => {
    expect(LIVE_UPDATE_CHANNELS).toContain("messages");
    expect(LIVE_UPDATE_CHANNELS).toContain("wallet-transactions");
    expect(LIVE_UPDATE_ACTIONS).toEqual(["created", "updated", "deleted", "invalidated"]);
  });

  it("validates untrusted server messages", () => {
    expect(
      isLiveUpdateServerMessage({
        type: "change",
        eventId: "event-1",
        channel: "messages",
        action: "updated",
        entityId: "message-1",
        occurredAt: "2026-07-12T12:00:00Z",
      }),
    ).toBe(true);
    expect(
      isLiveUpdateServerMessage({
        type: "change",
        eventId: "event-1",
        channel: "unknown-channel",
        action: "updated",
        occurredAt: "2026-07-12T12:00:00Z",
      }),
    ).toBe(false);
    expect(
      isLiveUpdateServerMessage({
        type: "hello",
        protocolVersion: 65_536,
        heartbeatIntervalSeconds: 30,
      }),
    ).toBe(false);
    expect(
      isLiveUpdateServerMessage({
        type: "hello",
        protocolVersion: 1,
        heartbeatIntervalSeconds: 30,
        unexpected: true,
      }),
    ).toBe(false);
  });

  it("rejects a contract without operation message references", async () => {
    const directory = await mkdtemp(join(tmpdir(), "live-update-asyncapi-"));
    try {
      const contractPath = resolve("../text-reach-backend/asyncapi/live-update.json");
      const contract = JSON.parse(await readFile(contractPath, "utf8"));
      delete contract.operations.clientMessages.messages;
      const invalidContractPath = join(directory, "live-update.json");
      await writeFile(invalidContractPath, JSON.stringify(contract));

      const child = spawn("bun", ["./scripts/generate-live-update.ts", "--check"], {
        cwd: resolve("."),
        env: { ...process.env, LIVE_UPDATE_ASYNCAPI_PATH: invalidContractPath },
      });
      let error = "";
      child.stderr.on("data", (chunk) => (error += String(chunk)));
      const exitCode = await new Promise<number | null>((resolveExit) => child.on("close", resolveExit));

      expect(exitCode).not.toBe(0);
      expect(error).toContain("must explicitly reference its messages");
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it("rejects a message assigned to both operation directions", async () => {
    const directory = await mkdtemp(join(tmpdir(), "live-update-asyncapi-"));
    try {
      const contractPath = resolve("../text-reach-backend/asyncapi/live-update.json");
      const contract = JSON.parse(await readFile(contractPath, "utf8"));
      contract.operations.serverMessages.messages.push({
        $ref: "#/channels/liveUpdates/messages/Subscribe",
      });
      const invalidContractPath = join(directory, "live-update.json");
      await writeFile(invalidContractPath, JSON.stringify(contract));

      const child = spawn("bun", ["./scripts/generate-live-update.ts", "--check"], {
        cwd: resolve("."),
        env: { ...process.env, LIVE_UPDATE_ASYNCAPI_PATH: invalidContractPath },
      });
      let error = "";
      child.stderr.on("data", (chunk) => (error += String(chunk)));
      const exitCode = await new Promise<number | null>((resolveExit) => child.on("close", resolveExit));

      expect(exitCode).not.toBe(0);
      expect(error).toContain("Subscribe has ambiguous direction");
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it("multiplexes subscriptions through one WebSocket", () => {
    const send = vi.fn();
    const socket = {
      readyState: 1,
      send,
      close: vi.fn(),
      onopen: null,
      onclose: null,
      onmessage: null,
    } as unknown as WebSocket;
    const factory = vi.fn(() => socket);
    const onMessage = vi.fn();
    const client = createLiveUpdateClient({
      url: "ws://localhost:8092/live-update/ws",
      onMessage,
      webSocketFactory: factory,
    });

    client.connect();
    client.connect();
    client.subscribe(["messages", "campaigns"], "subscribe-1");
    client.unsubscribe(["campaigns"], "unsubscribe-1");

    expect(factory).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenNthCalledWith(
      1,
      JSON.stringify({
        type: "subscribe",
        requestId: "subscribe-1",
        channels: ["messages", "campaigns"],
      }),
    );
    expect(send).toHaveBeenNthCalledWith(
      2,
      JSON.stringify({
        type: "unsubscribe",
        requestId: "unsubscribe-1",
        channels: ["campaigns"],
      }),
    );

    socket.onmessage?.call(
      socket,
      new MessageEvent("message", {
        data: JSON.stringify({
          type: "hello",
          protocolVersion: 1,
          heartbeatIntervalSeconds: 30,
        }),
      }),
    );
    expect(onMessage).toHaveBeenCalledWith({
      type: "hello",
      protocolVersion: 1,
      heartbeatIntervalSeconds: 30,
    });
  });
});
