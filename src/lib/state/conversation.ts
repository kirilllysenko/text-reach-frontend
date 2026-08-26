import { createStore } from "~/lib/state/store";
import {
  ConversationMessageDocument,
  ConversationMessagesDocument,
  ConversationsDocument,
  MarkConversationReadDocument,
  SendConversationMessageDocument,
  type ConversationFilterInput,
} from "~/gql/graphql";
import {
  matchesConversation,
  toChatMessage,
  toConversationViewModel,
  type ChatMessage,
  type ConversationViewModel,
} from "~/lib/feature/conversation/conversation-view-data";
import { graphqlClient } from "~/lib/graphql/client";
import { createLiveUpdateClient, type LiveUpdateClient, type LiveUpdateServerMessage } from "~/lib/live-update/client";

const CONVERSATION_PAGE_SIZE = 50;
const MESSAGE_PAGE_SIZE = 100;

interface ConversationStore {
  conversations: ConversationViewModel[];
  draft: string;
  hasMoreConversations: boolean;
  hasOlderMessages: boolean;
  listError: string | null;
  loading: boolean;
  loadingMessages: boolean;
  loadingMoreConversations: boolean;
  loadingOlderMessages: boolean;
  messageError: string | null;
  messages: ChatMessage[];
  mobileThreadOpen: boolean;
  realtimeConnected: boolean;
  search: string;
  selectedConversationId: string | null;
  sending: boolean;
}

const initialState: ConversationStore = {
  conversations: [],
  draft: "",
  hasMoreConversations: false,
  hasOlderMessages: false,
  listError: null,
  loading: true,
  loadingMessages: false,
  loadingMoreConversations: false,
  loadingOlderMessages: false,
  messageError: null,
  messages: [],
  mobileThreadOpen: false,
  realtimeConnected: false,
  search: "",
  selectedConversationId: null,
  sending: false,
};

export const [conversationState, setConversationState] = createStore<ConversationStore>({ ...initialState });

let liveUpdateClient: LiveUpdateClient | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
let conversationRefreshTimer: ReturnType<typeof setTimeout> | undefined;
let messageRefreshTimer: ReturnType<typeof setTimeout> | undefined;
let reconnectAttempt = 0;
let disposed = true;
let messageRequestVersion = 0;
let conversationRequestVersion = 0;
let nextConversationCursor: string | null = null;
let oldestMessageCursor: string | null = null;
let selectedTenantPhoneId: string | null = null;

export function selectedConversation(): ConversationViewModel | undefined {
  return conversationState.conversations.find(
    (conversation) => conversation.id === conversationState.selectedConversationId,
  );
}

export function filteredConversations(): ConversationViewModel[] {
  return conversationState.conversations.filter((conversation) =>
    matchesConversation(conversation, conversationState.search),
  );
}

export function initializeConversations(phoneId: string | null = null): void {
  disposeConversations();
  disposed = false;
  selectedTenantPhoneId = phoneId;
  setConversationState({ ...initialState });
  connectLiveUpdates();
  window.addEventListener("online", handleResume);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  void loadConversations();
}

export function disposeConversations(): void {
  disposed = true;
  clearScheduledWork();
  liveUpdateClient?.disconnect(1000, "Conversation screen closed");
  liveUpdateClient = null;
  if (typeof window !== "undefined") {
    window.removeEventListener("online", handleResume);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  }
}

export async function loadConversations(): Promise<void> {
  const requestVersion = ++conversationRequestVersion;
  setConversationState({ loading: true, listError: null });
  nextConversationCursor = null;
  await loadConversationPage(true, requestVersion);
  if (requestVersion === conversationRequestVersion) setConversationState("loading", false);
}

export function updateConversationSearch(value: string): void {
  setConversationState("search", value);
}

export function updateConversationDraft(value: string): void {
  setConversationState({ draft: value, messageError: null });
}

export function closeMobileConversation(): void {
  setConversationState("mobileThreadOpen", false);
}

export function setConversationPhoneFilter(phoneId: string | null): void {
  if (phoneId === selectedTenantPhoneId) return;
  selectedTenantPhoneId = phoneId;
  setConversationState({
    conversations: [],
    messages: [],
    selectedConversationId: null,
    mobileThreadOpen: false,
  });
  void loadConversations();
}

export async function selectConversation(conversationId: string): Promise<void> {
  setConversationState("mobileThreadOpen", true);
  if (conversationState.selectedConversationId === conversationId && conversationState.messages.length > 0) {
    await markSelectedConversationRead();
    return;
  }
  setConversationState({ selectedConversationId: conversationId, draft: "" });
  await loadMessages(true, conversationId);
}

export async function loadMoreConversations(): Promise<void> {
  if (!conversationState.hasMoreConversations || conversationState.loadingMoreConversations) return;
  setConversationState("loadingMoreConversations", true);
  await loadConversationPage(false);
  setConversationState("loadingMoreConversations", false);
}

export async function loadOlderMessages(): Promise<void> {
  if (
    !conversationState.hasOlderMessages ||
    conversationState.loadingOlderMessages ||
    !conversationState.selectedConversationId
  ) {
    return;
  }
  setConversationState("loadingOlderMessages", true);
  await loadMessages(false);
  setConversationState("loadingOlderMessages", false);
}

export async function sendConversationMessage(): Promise<boolean> {
  const conversationId = conversationState.selectedConversationId;
  const text = conversationState.draft.trim();
  if (!conversationId || !text || conversationState.sending) return false;

  const idempotencyKey = createIdempotencyKey();
  const optimisticId = `pending-${idempotencyKey}`;
  const optimisticMessage: ChatMessage = {
    campaign: null,
    createdAt: new Date().toISOString(),
    direction: "OUTBOUND",
    id: optimisticId,
    media: [],
    receivedAt: null,
    sentAt: null,
    status: "PENDING",
    text,
  };

  setConversationState({
    sending: true,
    messageError: null,
    draft: "",
    messages: [...conversationState.messages, optimisticMessage],
  });

  try {
    const response = await graphqlClient.mutation(SendConversationMessageDocument, {
      input: { conversationId, idempotencyKey, media: [], text },
    });
    if (response.error || !response.data?.sendConversationMessage) {
      handleSendError(conversationId, optimisticId, text);
      return false;
    }
    const sentMessage = toChatMessage(response.data.sendConversationMessage);
    if (conversationState.selectedConversationId === conversationId) {
      setConversationState(
        "messages",
        mergeMessages(
          conversationState.messages.filter((message) => message.id !== optimisticId),
          [sentMessage],
        ),
      );
    }
    bumpConversation(conversationId, sentMessage);
    return true;
  } catch {
    handleSendError(conversationId, optimisticId, text);
    return false;
  } finally {
    setConversationState("sending", false);
  }
}

async function loadConversationPage(reset: boolean, requestVersion = conversationRequestVersion): Promise<void> {
  try {
    const response = await graphqlClient.query(
      ConversationsDocument,
      {
        after: reset ? null : nextConversationCursor,
        filter: conversationFilter(),
        first: CONVERSATION_PAGE_SIZE,
      },
      { requestPolicy: "network-only" },
    );
    if (requestVersion !== conversationRequestVersion) return;
    if (response.error || !response.data) {
      setConversationState("listError", "Could not load conversations.");
      return;
    }
    const incoming = response.data.conversations.edges.map((edge) => toConversationViewModel(edge.node));
    const conversations = reset ? incoming : mergeConversations(conversationState.conversations, incoming);
    nextConversationCursor = response.data.conversations.pageInfo.endCursor ?? null;
    setConversationState({
      conversations,
      hasMoreConversations: response.data.conversations.pageInfo.hasNextPage,
      listError: null,
    });
    if (!conversationState.selectedConversationId && conversations.length > 0) {
      const conversationId = conversations[0]?.id ?? null;
      setConversationState("selectedConversationId", conversationId);
      if (conversationId) await loadMessages(true, conversationId);
    }
  } catch {
    if (requestVersion === conversationRequestVersion) {
      setConversationState("listError", "Could not load conversations.");
    }
  }
}

async function refreshConversations(): Promise<void> {
  if (disposed) return;
  const requestVersion = conversationRequestVersion;
  try {
    const response = await graphqlClient.query(
      ConversationsDocument,
      { after: null, filter: conversationFilter(), first: CONVERSATION_PAGE_SIZE },
      { requestPolicy: "network-only" },
    );
    if (requestVersion !== conversationRequestVersion || response.error || !response.data) return;
    const incoming = response.data.conversations.edges.map((edge) => toConversationViewModel(edge.node));
    setConversationState("conversations", mergeConversations(incoming, conversationState.conversations));
    nextConversationCursor = response.data.conversations.pageInfo.endCursor ?? null;
    setConversationState("hasMoreConversations", response.data.conversations.pageInfo.hasNextPage);
    await markSelectedConversationRead();
  } catch {
    // The next live event or reconnect refreshes the snapshot again.
  }
}

async function loadMessages(reset: boolean, selectedId = conversationState.selectedConversationId): Promise<void> {
  const conversationId = selectedId;
  if (!conversationId) return;
  const requestVersion = reset ? ++messageRequestVersion : messageRequestVersion;
  if (reset) {
    setConversationState({ loadingMessages: true, messages: [], messageError: null });
    oldestMessageCursor = null;
  }
  try {
    const response = await graphqlClient.query(
      ConversationMessagesDocument,
      {
        before: reset ? null : oldestMessageCursor,
        filter: { conversationId: { in: [conversationId] } },
        last: MESSAGE_PAGE_SIZE,
      },
      { requestPolicy: "network-only" },
    );
    if (requestVersion !== messageRequestVersion || conversationId !== conversationState.selectedConversationId) return;
    if (response.error || !response.data) {
      setConversationState("messageError", "Could not load messages.");
      return;
    }
    const incoming = response.data.messages.edges.map((edge) => toChatMessage(edge.node));
    setConversationState("messages", reset ? incoming : mergeMessages(incoming, conversationState.messages));
    oldestMessageCursor = response.data.messages.pageInfo.startCursor ?? null;
    setConversationState({
      hasOlderMessages: response.data.messages.pageInfo.hasPreviousPage,
      messageError: null,
    });
    await markSelectedConversationRead();
  } catch {
    if (requestVersion === messageRequestVersion) {
      setConversationState("messageError", "Could not load messages.");
    }
  } finally {
    if (reset && requestVersion === messageRequestVersion) setConversationState("loadingMessages", false);
  }
}

async function refreshActiveMessages(): Promise<void> {
  const conversationId = conversationState.selectedConversationId;
  if (!conversationId || disposed) return;
  try {
    const response = await graphqlClient.query(
      ConversationMessagesDocument,
      { before: null, filter: { conversationId: { in: [conversationId] } }, last: MESSAGE_PAGE_SIZE },
      { requestPolicy: "network-only" },
    );
    if (response.error || !response.data || conversationId !== conversationState.selectedConversationId) return;
    const incoming = response.data.messages.edges.map((edge) => toChatMessage(edge.node));
    setConversationState("messages", mergeMessages(conversationState.messages, incoming));
    if (isThreadVisible()) await markSelectedConversationRead();
  } catch {
    // Keep the current thread; reconnect performs another snapshot refresh.
  }
}

async function refreshMessage(messageId: string): Promise<void> {
  try {
    const response = await graphqlClient.query(
      ConversationMessageDocument,
      { id: messageId },
      { requestPolicy: "network-only" },
    );
    const message = response.data?.message;
    if (response.error || !message || message.conversation.id !== conversationState.selectedConversationId) return;
    setConversationState("messages", mergeMessages(conversationState.messages, [toChatMessage(message)]));
    if (message.direction === "INBOUND" && isThreadVisible()) await markSelectedConversationRead();
  } catch {
    scheduleMessageRefresh();
  }
}

async function markSelectedConversationRead(): Promise<void> {
  const conversation = selectedConversation();
  if (!conversation || conversation.unreadCount === 0 || !isThreadVisible()) return;
  const throughMessageId = conversationState.messages.at(-1)?.id;
  if (throughMessageId?.startsWith("pending-")) return;
  try {
    const response = await graphqlClient.mutation(MarkConversationReadDocument, {
      conversationId: conversation.id,
      throughMessageId: throughMessageId ?? null,
    });
    if (response.error || !response.data?.markConversationRead) return;
    setConversationState(
      "conversations",
      conversationState.conversations.map((item) => (item.id === conversation.id ? { ...item, unreadCount: 0 } : item)),
    );
  } catch {
    // Read state is retried when the thread or app becomes active again.
  }
}

function connectLiveUpdates(): void {
  if (disposed) return;
  if (reconnectTimer) clearTimeout(reconnectTimer);
  reconnectTimer = undefined;
  liveUpdateClient = createLiveUpdateClient({
    url: liveUpdateUrl(window.location),
    onOpen: () => {
      setConversationState("realtimeConnected", true);
      reconnectAttempt = 0;
      liveUpdateClient?.subscribe(["messages", "conversations"]);
      void refreshConversations();
      scheduleMessageRefresh();
    },
    onClose: () => {
      setConversationState("realtimeConnected", false);
      scheduleReconnect();
    },
    onMessage: handleLiveUpdateMessage,
  });
  liveUpdateClient.connect();
}

function handleLiveUpdateMessage(message: LiveUpdateServerMessage): void {
  if (message.type !== "change") return;
  if (message.channel === "conversations") {
    scheduleConversationRefresh();
    return;
  }
  if (message.channel !== "messages") return;
  scheduleConversationRefresh();
  if (message.entityId) void refreshMessage(message.entityId);
  else scheduleMessageRefresh();
}

function scheduleConversationRefresh(): void {
  if (conversationRefreshTimer) clearTimeout(conversationRefreshTimer);
  conversationRefreshTimer = setTimeout(() => void refreshConversations(), 180);
}

function scheduleMessageRefresh(): void {
  if (messageRefreshTimer) clearTimeout(messageRefreshTimer);
  messageRefreshTimer = setTimeout(() => void refreshActiveMessages(), 120);
}

function scheduleReconnect(): void {
  if (disposed || reconnectTimer) return;
  const delay = Math.min(1000 * 2 ** reconnectAttempt, 30_000);
  reconnectAttempt += 1;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = undefined;
    connectLiveUpdates();
  }, delay);
}

function handleResume(): void {
  void refreshConversations();
  scheduleMessageRefresh();
  if (!liveUpdateClient || liveUpdateClient.readyState === 3) connectLiveUpdates();
}

function handleVisibilityChange(): void {
  if (document.visibilityState === "visible") handleResume();
}

function handleSendError(conversationId: string, optimisticId: string, text: string): void {
  if (conversationState.selectedConversationId !== conversationId) return;
  setConversationState(
    "messages",
    conversationState.messages.filter((message) => message.id !== optimisticId),
  );
  if (!conversationState.draft) setConversationState("draft", text);
  setConversationState("messageError", "Message could not be sent. Try again.");
}

function bumpConversation(conversationId: string, message: ChatMessage): void {
  const selected = conversationState.conversations.find((conversation) => conversation.id === conversationId);
  if (!selected) return;
  const updated: ConversationViewModel = {
    ...selected,
    lastMessage: {
      __typename: "Message",
      createdAt: message.createdAt,
      direction: message.direction,
      id: message.id,
      media: message.media.map(({ contentType, url }) => ({ __typename: "MessageMedia", contentType, url })),
      status: message.status,
      text: message.text,
    },
    updatedAt: message.createdAt,
  };
  setConversationState("conversations", [
    updated,
    ...conversationState.conversations.filter((conversation) => conversation.id !== conversationId),
  ]);
}

function clearScheduledWork(): void {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  if (conversationRefreshTimer) clearTimeout(conversationRefreshTimer);
  if (messageRefreshTimer) clearTimeout(messageRefreshTimer);
  reconnectTimer = undefined;
  conversationRefreshTimer = undefined;
  messageRefreshTimer = undefined;
}

function isThreadVisible(): boolean {
  return (
    document.visibilityState === "visible" &&
    (window.matchMedia("(min-width: 640px)").matches || conversationState.mobileThreadOpen)
  );
}

function conversationFilter(): ConversationFilterInput | undefined {
  return selectedTenantPhoneId ? { tenantPhoneId: { in: [selectedTenantPhoneId] } } : undefined;
}

function mergeConversations(
  primary: ConversationViewModel[],
  secondary: ConversationViewModel[],
): ConversationViewModel[] {
  const byId = new Map(secondary.map((conversation) => [conversation.id, conversation]));
  for (const conversation of primary) byId.set(conversation.id, conversation);
  return [...byId.values()].sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt));
}

function mergeMessages(primary: ChatMessage[], secondary: ChatMessage[]): ChatMessage[] {
  const byId = new Map(primary.map((message) => [message.id, message]));
  for (const message of secondary) byId.set(message.id, message);
  return [...byId.values()].sort((left, right) => {
    const difference = Date.parse(left.createdAt) - Date.parse(right.createdAt);
    return difference || left.id.localeCompare(right.id);
  });
}

function createIdempotencyKey(): string {
  return globalThis.crypto?.randomUUID?.() ?? `conversation-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function liveUpdateUrl(location: Location): string {
  const protocol = location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${location.host}/live-update/ws`;
}
