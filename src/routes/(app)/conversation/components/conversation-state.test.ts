import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ChatMessage, ConversationViewModel } from "./conversation-view-data";

const stores = vi.hoisted(() => ({
  conversationsFetch: vi.fn(),
  markReadMutate: vi.fn(),
  messageFetch: vi.fn(),
  messagesFetch: vi.fn(),
  sendMessageMutate: vi.fn(),
}));

vi.mock("$houdini", () => ({
  ConversationMessageStore: class {
    fetch = stores.messageFetch;
  },
  ConversationMessagesStore: class {
    fetch = stores.messagesFetch;
  },
  ConversationsStore: class {
    fetch = stores.conversationsFetch;
  },
  MarkConversationReadStore: class {
    mutate = stores.markReadMutate;
  },
  SendConversationMessageStore: class {
    mutate = stores.sendMessageMutate;
  },
}));

const activeStates: Array<{ dispose: () => void }> = [];

beforeEach(() => {
  stores.conversationsFetch.mockReset().mockResolvedValue({
    data: {
      conversations: {
        edges: [],
        pageInfo: { endCursor: null, hasNextPage: false },
      },
    },
  });
  stores.markReadMutate.mockReset();
  stores.messageFetch.mockReset();
  stores.messagesFetch.mockReset();
  stores.sendMessageMutate.mockReset();
});

afterEach(() => {
  for (const state of activeStates.splice(0)) state.dispose();
});

describe("ConversationState", () => {
  it("loads conversations for the selected tenant phone and can return to all phones", async () => {
    const { ConversationState } = await import("./conversation-state.svelte");
    const state = new ConversationState("01K00000000000000000000010");
    activeStates.push(state);

    await vi.waitFor(() => expect(stores.conversationsFetch).toHaveBeenCalledOnce());
    expect(stores.conversationsFetch).toHaveBeenLastCalledWith({
      variables: {
        after: null,
        filter: { tenantPhoneId: { in: ["01K00000000000000000000010"] } },
        first: 50,
      },
    });

    state.setPhoneFilter(null);

    await vi.waitFor(() => expect(stores.conversationsFetch).toHaveBeenCalledTimes(2));
    expect(stores.conversationsFetch).toHaveBeenLastCalledWith({
      variables: { after: null, filter: undefined, first: 50 },
    });
  });

  it("keeps an in-flight send attached to its original conversation", async () => {
    let resolveSend: ((response: unknown) => void) | undefined;
    stores.sendMessageMutate.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSend = resolve;
        }),
    );

    const { ConversationState } = await import("./conversation-state.svelte");
    const state = new ConversationState();
    activeStates.push(state);
    await vi.waitFor(() => expect(stores.conversationsFetch).toHaveBeenCalledOnce());

    const first = conversation("01K00000000000000000000001", "First Contact");
    const second = conversation("01K00000000000000000000002", "Second Contact");
    state.conversations = [first, second];
    state.selectedConversationId = first.id;
    state.draft = "Reply to the first conversation";

    const send = state.sendMessage();
    await vi.waitFor(() => expect(stores.sendMessageMutate).toHaveBeenCalledOnce());

    state.selectedConversationId = second.id;
    state.messages = [];
    resolveSend?.({ data: { sendConversationMessage: sentMessage() } });

    await expect(send).resolves.toBe(true);
    expect(state.messages).toEqual([]);
    expect(state.conversations.find((item) => item.id === first.id)?.lastMessage?.text).toBe(
      "Reply to the first conversation",
    );
    expect(state.conversations.find((item) => item.id === second.id)?.lastMessage).toBeNull();
  });
});

function conversation(id: string, firstName: string): ConversationViewModel {
  return {
    contact: {
      firstName,
      id: `${id.slice(0, -1)}9`,
      lastName: null,
      phoneNumber: "+14155550123",
    },
    contactPhoneNumber: "+14155550123",
    id,
    lastMessage: null,
    tenantPhoneNumber: "+14155550999",
    unreadCount: 0,
    updatedAt: "2026-08-17T12:00:00Z",
  };
}

function sentMessage(): ChatMessage {
  return {
    campaign: null,
    createdAt: "2026-08-17T12:01:00Z",
    direction: "OUTBOUND",
    id: "01K00000000000000000000003",
    media: [],
    receivedAt: null,
    sentAt: null,
    status: "PENDING",
    text: "Reply to the first conversation",
  };
}
