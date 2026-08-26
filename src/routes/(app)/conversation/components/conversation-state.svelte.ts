import {
  ConversationMessageStore,
  ConversationMessagesStore,
  ConversationsStore,
  MarkConversationReadStore,
  SendConversationMessageStore,
} from "$houdini";
import type { ConversationFilterInput } from "$houdini/graphql/inputs";
import {
  createLiveUpdateClient,
  type LiveUpdateClient,
  type LiveUpdateServerMessage,
} from "$lib/live-update/generated";
import { debounce } from "$lib/utils/debounce";
import {
  matchesConversation,
  toChatMessage,
  toConversationViewModel,
  type ChatMessage,
  type ConversationViewModel,
} from "./conversation-view-data";

const CONVERSATION_PAGE_SIZE = 50;
const MESSAGE_PAGE_SIZE = 100;

export class ConversationState {
  private readonly conversationsQuery = new ConversationsStore();
  private readonly messagesQuery = new ConversationMessagesStore();
  private readonly messageQuery = new ConversationMessageStore();
  private readonly sendMessageMutation = new SendConversationMessageStore();
  private readonly markReadMutation = new MarkConversationReadStore();
  private liveUpdateClient: LiveUpdateClient | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | undefined;
  private reconnectAttempt = 0;
  private disposed = false;
  private messageRequestVersion = 0;
  private conversationRequestVersion = 0;
  private nextConversationCursor: string | null = null;
  private oldestMessageCursor: string | null = null;
  private readonly scheduleConversationRefresh = debounce(() => void this.refreshConversations(true), 180);
  private readonly scheduleMessageRefresh = debounce(() => void this.refreshActiveMessages(), 120);

  conversations = $state<ConversationViewModel[]>([]);
  messages = $state<ChatMessage[]>([]);
  selectedConversationId = $state<string | null>(null);
  search = $state("");
  draft = $state("");
  mobileThreadOpen = $state(false);
  loading = $state(true);
  loadingMoreConversations = $state(false);
  loadingMessages = $state(false);
  loadingOlderMessages = $state(false);
  sending = $state(false);
  hasMoreConversations = $state(false);
  hasOlderMessages = $state(false);
  realtimeConnected = $state(false);
  listError = $state<string | null>(null);
  messageError = $state<string | null>(null);
  private selectedTenantPhoneId = $state<string | null>(null);

  selectedConversation = $derived.by(() =>
    this.conversations.find((conversation) => conversation.id === this.selectedConversationId),
  );

  filteredConversations = $derived.by(() =>
    this.conversations.filter((conversation) => matchesConversation(conversation, this.search)),
  );

  constructor(selectedTenantPhoneId: string | null = null) {
    this.selectedTenantPhoneId = selectedTenantPhoneId;
    this.connectLiveUpdates();
    if (typeof window !== "undefined") {
      window.addEventListener("online", this.handleResume);
      document.addEventListener("visibilitychange", this.handleVisibilityChange);
    }
    void this.load();
  }

  load = async (): Promise<void> => {
    const requestVersion = ++this.conversationRequestVersion;
    this.loading = true;
    this.listError = null;
    this.nextConversationCursor = null;
    await this.loadConversationPage(true, requestVersion);
    if (requestVersion === this.conversationRequestVersion) {
      this.loading = false;
    }
  };

  retry = async (): Promise<void> => {
    await this.load();
  };

  loadMoreConversations = async (): Promise<void> => {
    if (!this.hasMoreConversations || this.loadingMoreConversations) return;
    this.loadingMoreConversations = true;
    await this.loadConversationPage(false);
    this.loadingMoreConversations = false;
  };

  selectConversation = async (conversationId: string): Promise<void> => {
    this.mobileThreadOpen = true;
    if (this.selectedConversationId === conversationId && this.messages.length > 0) {
      await this.markSelectedConversationRead();
      return;
    }

    this.selectedConversationId = conversationId;
    this.draft = "";
    await this.loadMessages(true);
  };

  closeMobileThread = (): void => {
    this.mobileThreadOpen = false;
  };

  updateSearch = (value: string): void => {
    this.search = value;
  };

  setPhoneFilter = (phoneId: string | null): void => {
    if (phoneId === this.selectedTenantPhoneId) {
      return;
    }

    this.selectedTenantPhoneId = phoneId;
    this.conversations = [];
    this.messages = [];
    this.selectedConversationId = null;
    this.mobileThreadOpen = false;
    void this.load();
  };

  updateDraft = (value: string): void => {
    this.draft = value;
    this.messageError = null;
  };

  loadOlderMessages = async (): Promise<void> => {
    if (!this.hasOlderMessages || this.loadingOlderMessages || !this.selectedConversationId) return;
    this.loadingOlderMessages = true;
    await this.loadMessages(false);
    this.loadingOlderMessages = false;
  };

  sendMessage = async (): Promise<boolean> => {
    const conversationId = this.selectedConversationId;
    const text = this.draft.trim();
    if (!conversationId || !text || this.sending) return false;

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

    this.sending = true;
    this.messageError = null;
    this.draft = "";
    this.messages = [...this.messages, optimisticMessage];

    try {
      const response = await this.sendMessageMutation.mutate({
        input: { conversationId, idempotencyKey, media: [], text },
      });
      if (response.errors || !response.data?.sendConversationMessage) {
        this.handleSendError(conversationId, optimisticId, text);
        return false;
      }

      const sentMessage = toChatMessage(response.data.sendConversationMessage);
      if (this.selectedConversationId === conversationId) {
        this.messages = mergeMessages(
          this.messages.filter((message) => message.id !== optimisticId),
          [sentMessage],
        );
      }
      this.bumpConversation(conversationId, sentMessage);
      return true;
    } catch {
      this.handleSendError(conversationId, optimisticId, text);
      return false;
    } finally {
      this.sending = false;
    }
  };

  dispose = (): void => {
    this.disposed = true;
    this.scheduleConversationRefresh.cancel();
    this.scheduleMessageRefresh.cancel();
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.liveUpdateClient?.disconnect(1000, "Conversation screen closed");
    if (typeof window !== "undefined") {
      window.removeEventListener("online", this.handleResume);
      document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    }
  };

  private async loadConversationPage(reset: boolean, requestVersion = this.conversationRequestVersion): Promise<void> {
    try {
      const response = await this.conversationsQuery.fetch({
        variables: {
          after: reset ? null : this.nextConversationCursor,
          filter: this.conversationFilter(),
          first: CONVERSATION_PAGE_SIZE,
        },
      });
      if (requestVersion !== this.conversationRequestVersion) return;
      if (response.errors || !response.data) {
        this.listError = "Could not load conversations.";
        return;
      }

      const incoming = response.data.conversations.edges.map((edge) => toConversationViewModel(edge.node));
      this.conversations = reset ? incoming : mergeConversations(this.conversations, incoming);
      this.nextConversationCursor = response.data.conversations.pageInfo.endCursor ?? null;
      this.hasMoreConversations = response.data.conversations.pageInfo.hasNextPage;
      this.listError = null;

      if (!this.selectedConversationId && this.conversations.length > 0) {
        this.selectedConversationId = this.conversations[0]?.id ?? null;
        await this.loadMessages(true);
      }
    } catch {
      if (requestVersion !== this.conversationRequestVersion) return;
      this.listError = "Could not load conversations.";
    }
  }

  private async refreshConversations(preserveLoaded: boolean): Promise<void> {
    if (this.disposed) return;
    const requestVersion = this.conversationRequestVersion;
    try {
      const response = await this.conversationsQuery.fetch({
        variables: {
          after: null,
          filter: this.conversationFilter(),
          first: CONVERSATION_PAGE_SIZE,
        },
      });
      if (requestVersion !== this.conversationRequestVersion || response.errors || !response.data) return;

      const incoming = response.data.conversations.edges.map((edge) => toConversationViewModel(edge.node));
      this.conversations = preserveLoaded ? mergeConversations(incoming, this.conversations) : incoming;
      this.nextConversationCursor = response.data.conversations.pageInfo.endCursor ?? null;
      this.hasMoreConversations = response.data.conversations.pageInfo.hasNextPage;
      await this.markSelectedConversationRead();
    } catch {
      // A later live event, reconnect, or manual retry will refresh the snapshot.
    }
  }

  private async loadMessages(reset: boolean): Promise<void> {
    const conversationId = this.selectedConversationId;
    if (!conversationId) return;

    const requestVersion = reset ? ++this.messageRequestVersion : this.messageRequestVersion;
    if (reset) {
      this.loadingMessages = true;
      this.messages = [];
      this.oldestMessageCursor = null;
      this.messageError = null;
    }

    try {
      const response = await this.messagesQuery.fetch({
        variables: {
          before: reset ? null : this.oldestMessageCursor,
          filter: { conversationId: { in: [conversationId] } },
          last: MESSAGE_PAGE_SIZE,
        },
      });
      if (requestVersion !== this.messageRequestVersion || conversationId !== this.selectedConversationId) return;
      if (response.errors || !response.data) {
        this.messageError = "Could not load messages.";
        return;
      }

      const incoming = response.data.messages.edges.map((edge) => toChatMessage(edge.node));
      this.messages = reset ? incoming : mergeMessages(incoming, this.messages);
      this.oldestMessageCursor = response.data.messages.pageInfo.startCursor ?? null;
      this.hasOlderMessages = response.data.messages.pageInfo.hasPreviousPage;
      this.messageError = null;
      await this.markSelectedConversationRead();
    } catch {
      if (requestVersion === this.messageRequestVersion) this.messageError = "Could not load messages.";
    } finally {
      if (reset && requestVersion === this.messageRequestVersion) this.loadingMessages = false;
    }
  }

  private async refreshActiveMessages(): Promise<void> {
    const conversationId = this.selectedConversationId;
    if (!conversationId || this.disposed) return;
    try {
      const response = await this.messagesQuery.fetch({
        variables: {
          before: null,
          filter: { conversationId: { in: [conversationId] } },
          last: MESSAGE_PAGE_SIZE,
        },
      });
      if (response.errors || !response.data || conversationId !== this.selectedConversationId) return;
      const incoming = response.data.messages.edges.map((edge) => toChatMessage(edge.node));
      this.messages = mergeMessages(this.messages, incoming);
      if (this.isThreadVisible()) await this.markSelectedConversationRead();
    } catch {
      // Keep the current thread; reconnect always performs another snapshot refresh.
    }
  }

  private async refreshMessage(messageId: string): Promise<void> {
    try {
      const response = await this.messageQuery.fetch({ variables: { id: messageId } });
      const message = response.data?.message;
      if (response.errors || !message || message.conversation.id !== this.selectedConversationId) return;
      this.messages = mergeMessages(this.messages, [toChatMessage(message)]);
      if (message.direction === "INBOUND" && this.isThreadVisible()) await this.markSelectedConversationRead();
    } catch {
      this.scheduleMessageRefresh();
    }
  }

  private async markSelectedConversationRead(): Promise<void> {
    const conversation = this.selectedConversation;
    if (!conversation || conversation.unreadCount === 0 || !this.isThreadVisible()) return;
    const throughMessageId = this.messages.at(-1)?.id;
    if (throughMessageId?.startsWith("pending-")) return;

    try {
      const response = await this.markReadMutation.mutate({
        conversationId: conversation.id,
        throughMessageId: throughMessageId ?? null,
      });
      if (response.errors || !response.data?.markConversationRead) return;
      this.conversations = this.conversations.map((item) =>
        item.id === conversation.id ? { ...item, unreadCount: 0 } : item,
      );
    } catch {
      // Read state will be retried when the thread or app becomes active again.
    }
  }

  private connectLiveUpdates(): void {
    if (typeof window === "undefined" || this.disposed) return;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }

    this.liveUpdateClient = createLiveUpdateClient({
      url: liveUpdateUrl(window.location),
      onOpen: () => {
        this.realtimeConnected = true;
        this.reconnectAttempt = 0;
        this.liveUpdateClient?.subscribe(["messages", "conversations"]);
        void this.refreshConversations(true);
        this.scheduleMessageRefresh();
      },
      onClose: () => {
        this.realtimeConnected = false;
        this.scheduleReconnect();
      },
      onMessage: this.handleLiveUpdateMessage,
    });
    this.liveUpdateClient.connect();
  }

  private handleLiveUpdateMessage = (message: LiveUpdateServerMessage): void => {
    if (message.type !== "change") return;
    if (message.channel === "conversations") {
      this.scheduleConversationRefresh();
      return;
    }
    if (message.channel !== "messages") return;

    this.scheduleConversationRefresh();
    if (message.entityId) void this.refreshMessage(message.entityId);
    else this.scheduleMessageRefresh();
  };

  private scheduleReconnect(): void {
    if (this.disposed || this.reconnectTimer) return;
    const delay = Math.min(1000 * 2 ** this.reconnectAttempt, 30_000);
    this.reconnectAttempt += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined;
      this.connectLiveUpdates();
    }, delay);
  }

  private handleResume = (): void => {
    void this.refreshConversations(true);
    this.scheduleMessageRefresh();
    if (!this.liveUpdateClient || this.liveUpdateClient.readyState === 3) this.connectLiveUpdates();
  };

  private handleVisibilityChange = (): void => {
    if (document.visibilityState === "visible") this.handleResume();
  };

  private handleSendError(conversationId: string, optimisticId: string, text: string): void {
    if (this.selectedConversationId !== conversationId) return;
    this.messages = this.messages.filter((message) => message.id !== optimisticId);
    if (!this.draft) this.draft = text;
    this.messageError = "Message could not be sent. Try again.";
  }

  private bumpConversation(conversationId: string, message: ChatMessage): void {
    const selected = this.conversations.find((conversation) => conversation.id === conversationId);
    if (!selected) return;

    const updated: ConversationViewModel = {
      ...selected,
      lastMessage: {
        createdAt: message.createdAt,
        direction: message.direction,
        id: message.id,
        media: message.media.map(({ contentType, url }) => ({ contentType, url })),
        status: message.status,
        text: message.text,
      },
      updatedAt: message.createdAt,
    };
    this.conversations = [updated, ...this.conversations.filter((conversation) => conversation.id !== conversationId)];
  }

  private isThreadVisible(): boolean {
    if (typeof window === "undefined" || document.visibilityState !== "visible") return false;
    return window.matchMedia("(min-width: 640px)").matches || this.mobileThreadOpen;
  }

  private conversationFilter(): ConversationFilterInput | undefined {
    return this.selectedTenantPhoneId ? { tenantPhoneId: { in: [this.selectedTenantPhoneId] } } : undefined;
  }
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
    const timeDifference = Date.parse(left.createdAt) - Date.parse(right.createdAt);
    return timeDifference || left.id.localeCompare(right.id);
  });
}

function createIdempotencyKey(): string {
  return globalThis.crypto?.randomUUID?.() ?? `conversation-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function liveUpdateUrl(location: Location): string {
  const protocol = location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${location.host}/live-update/ws`;
}
