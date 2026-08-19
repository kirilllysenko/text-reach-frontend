<script lang="ts" module>
  interface MessageGroup {
    key: string;
    label: string;
    messages: ChatMessage[];
  }

  const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" });

  function groupMessagesByDay(messages: ChatMessage[]): MessageGroup[] {
    const groups = new Map<string, ChatMessage[]>();
    for (const message of messages) {
      const date = new Date(messageTimestamp(message));
      const key = Number.isNaN(date.getTime()) ? "unknown" : localDateKey(date);
      groups.set(key, [...(groups.get(key) ?? []), message]);
    }
    return [...groups].map(([key, groupedMessages]) => ({
      key,
      label: dateLabel(key),
      messages: groupedMessages,
    }));
  }

  function dateLabel(key: string): string {
    if (key === "unknown") return "Earlier";
    const date = new Date(`${key}T12:00:00`);
    const today = new Date();
    const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    if (key === localDateKey(today)) return "Today";
    if (key === localDateKey(yesterday)) return "Yesterday";
    return dateFormatter.format(date);
  }

  function localDateKey(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
  }
</script>

<script lang="ts">
  import { tick } from "svelte";
  import type { ConversationState } from "./conversation-state.svelte";
  import {
    conversationInitials,
    conversationTitle,
    formatPhoneNumber,
    messageTimestamp,
    type ChatMessage,
  } from "./conversation-view-data";
  import MessageBubble from "./MessageBubble.svelte";
  import MessageComposer from "./MessageComposer.svelte";

  interface Props {
    state: ConversationState;
  }

  let { state: conversationState }: Props = $props();
  let messagesElement = $state<HTMLDivElement>();
  let previousLastMessageId: string | undefined;

  const title = $derived(
    conversationState.selectedConversation ? conversationTitle(conversationState.selectedConversation) : "",
  );
  const initials = $derived(
    conversationState.selectedConversation ? conversationInitials(conversationState.selectedConversation) : "",
  );
  const groups = $derived.by(() => groupMessagesByDay(conversationState.messages));

  $effect(() => {
    const lastMessageId = conversationState.messages.at(-1)?.id;
    if (!lastMessageId || lastMessageId === previousLastMessageId) return;
    const lastMessage = conversationState.messages.at(-1);
    const shouldScroll =
      !messagesElement ||
      lastMessage?.direction === "OUTBOUND" ||
      messagesElement.scrollHeight - messagesElement.clientHeight - messagesElement.scrollTop < 120;
    previousLastMessageId = lastMessageId;
    if (shouldScroll) void tick().then(() => messagesElement?.scrollTo({ top: messagesElement.scrollHeight }));
  });

  async function loadOlder(): Promise<void> {
    if (!messagesElement) return;
    const oldHeight = messagesElement.scrollHeight;
    const oldTop = messagesElement.scrollTop;
    await conversationState.loadOlderMessages();
    await tick();
    messagesElement.scrollTop = oldTop + messagesElement.scrollHeight - oldHeight;
  }
</script>

<section
  class="flex h-full min-h-0 flex-col bg-slate-50"
  aria-label={title ? `Conversation with ${title}` : "Conversation"}
>
  {#if conversationState.selectedConversation}
    <header
      class="flex min-h-16 items-center gap-3 border-b border-slate-200/80 bg-slate-100/95 px-3 pt-[env(safe-area-inset-top)]
        shadow-sm sm:px-4 sm:pt-0"
    >
      <button
        type="button"
        class="-ml-1 rounded-full p-2 hover:cursor-pointer hover:bg-white/80 focus-visible:outline-2 focus-visible:outline-sky-500 sm:hidden"
        onclick={conversationState.closeMobileThread}
        aria-label="Back to conversations"
      >
        <svg class="size-5 fill-none stroke-slate-600" viewBox="0 0 24 24" aria-hidden="true">
          <path d="m15 18-6-6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
      </button>

      <div
        class="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-600
          text-xs font-semibold tracking-wide text-white shadow-sm"
        aria-hidden="true"
      >
        {initials}
      </div>

      <div class="min-w-0 grow">
        <h2 class="truncate font-semibold text-slate-800">{title}</h2>
        <p class="truncate text-xs text-slate-500">
          {formatPhoneNumber(conversationState.selectedConversation.contactPhoneNumber)} · via
          {formatPhoneNumber(conversationState.selectedConversation.tenantPhoneNumber)}
        </p>
      </div>
    </header>

    <div bind:this={messagesElement} class="chat-wallpaper min-h-0 grow overflow-y-auto overscroll-contain py-3">
      {#if conversationState.loadingMessages}
        <div class="flex h-full items-center justify-center" aria-label="Loading messages">
          <div class="rounded-full bg-white/90 px-4 py-2 text-sm text-slate-500 shadow-sm">Loading messages…</div>
        </div>
      {:else if conversationState.messages.length === 0}
        <div class="flex h-full min-h-64 items-center justify-center px-6">
          <div class="bg-amber-50/95 text-amber-950 max-w-sm rounded-xl px-4 py-3 text-center text-sm shadow-sm">
            This is the beginning of your conversation with {title}. Messages are sent from
            {formatPhoneNumber(conversationState.selectedConversation.tenantPhoneNumber)}.
          </div>
        </div>
      {:else}
        {#if conversationState.hasOlderMessages}
          <div class="mb-3 text-center">
            <button
              class="rounded-full bg-white/90 px-4 py-1.5 text-xs font-medium text-sky-700 shadow-sm hover:cursor-pointer
                hover:bg-white disabled:text-slate-400"
              type="button"
              disabled={conversationState.loadingOlderMessages}
              onclick={loadOlder}
            >
              {conversationState.loadingOlderMessages ? "Loading…" : "Load earlier messages"}
            </button>
          </div>
        {/if}

        <div class="space-y-3 pb-1">
          {#each groups as group (group.key)}
            <div class="pointer-events-none sticky top-2 z-10 my-3 flex justify-center">
              <time
                class="rounded-lg bg-white/90 px-3 py-1 text-[0.68rem] font-medium tracking-wide text-slate-500 uppercase shadow-sm"
                datetime={group.key}
              >
                {group.label}
              </time>
            </div>
            {#each group.messages as message (message.id)}
              <MessageBubble {message} />
            {/each}
          {/each}
        </div>
      {/if}
    </div>

    {#if conversationState.messageError}
      <div
        class="bg-rose-50 border-t border-rose-100 px-4 py-2 text-center text-xs font-medium text-rose-700"
        role="alert"
      >
        {conversationState.messageError}
      </div>
    {/if}

    <MessageComposer state={conversationState} />
  {:else}
    <div class="chat-wallpaper flex h-full items-center justify-center px-8 text-center">
      <div class="max-w-md">
        <div class="mx-auto mb-5 flex size-20 items-center justify-center rounded-full bg-white/80 shadow-sm">
          <svg class="size-10 fill-none stroke-emerald-600" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M20 11.5a8 8 0 0 1-11.7 7.1L4 20l1.4-4.1A8 8 0 1 1 20 11.5Z"
              stroke-width="1.6"
              stroke-linejoin="round"
            ></path>
            <path d="M8 10h8M8 14h5" stroke-width="1.6" stroke-linecap="round"></path>
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-slate-700">Your conversations</h2>
        <p class="mt-2 text-sm leading-6 text-slate-500">
          Select a chat to read messages and reply from your business number.
        </p>
      </div>
    </div>
  {/if}
</section>

<style>
  .chat-wallpaper {
    background-color: #eef2f1;
    background-image:
      radial-gradient(circle at 15px 15px, rgba(100, 116, 139, 0.055) 1.5px, transparent 1.5px),
      radial-gradient(circle at 38px 42px, rgba(16, 185, 129, 0.045) 1px, transparent 1px);
    background-size:
      52px 52px,
      68px 68px;
  }
</style>
