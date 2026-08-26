import { createEffect, createMemo, For, Show } from "solid-js";
import type { ChatMessage } from "~/lib/feature/conversation/conversation-view-data";
import {
  conversationInitials,
  conversationTitle,
  formatPhoneNumber,
  messageTimestamp,
} from "~/lib/feature/conversation/conversation-view-data";
import {
  closeMobileConversation,
  conversationState,
  loadOlderMessages,
  selectedConversation,
  sendConversationMessage,
  updateConversationDraft,
} from "~/lib/state/conversation";
import { MessageBubble } from "./MessageBubble";

interface MessageGroup {
  key: string;
  label: string;
  messages: ChatMessage[];
}

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" });

export function ConversationThread() {
  let messagesElement: HTMLDivElement | undefined;
  let previousLastMessageId: string | undefined;
  const groups = createMemo(() => groupMessagesByDay(conversationState.messages));

  createEffect(
    () => conversationState.messages.at(-1),
    (lastMessage) => {
      if (!lastMessage || lastMessage.id === previousLastMessageId) return;
      const shouldScroll =
        !messagesElement ||
        lastMessage.direction === "OUTBOUND" ||
        messagesElement.scrollHeight - messagesElement.clientHeight - messagesElement.scrollTop < 120;
      previousLastMessageId = lastMessage.id;
      if (shouldScroll) requestAnimationFrame(() => messagesElement?.scrollTo({ top: messagesElement.scrollHeight }));
    },
  );

  async function loadOlder(): Promise<void> {
    if (!messagesElement) return;
    const oldHeight = messagesElement.scrollHeight;
    const oldTop = messagesElement.scrollTop;
    await loadOlderMessages();
    requestAnimationFrame(() => {
      if (messagesElement) messagesElement.scrollTop = oldTop + messagesElement.scrollHeight - oldHeight;
    });
  }

  return (
    <section
      class="flex h-full min-h-0 flex-col bg-slate-50"
      aria-label={
        selectedConversation() ? `Conversation with ${conversationTitle(selectedConversation()!)}` : "Conversation"
      }
    >
      <Show when={selectedConversation()} keyed fallback={<EmptyThread />}>
        {(conversation) => (
          <>
            <header class="flex min-h-16 items-center gap-3 border-b border-slate-200/80 bg-slate-100/95 px-3 pt-[env(safe-area-inset-top)] shadow-sm sm:px-4 sm:pt-0">
              <button
                type="button"
                class="-ml-1 rounded-full p-2 hover:cursor-pointer hover:bg-white/80 focus-visible:outline-2 focus-visible:outline-sky-500 sm:hidden"
                onClick={closeMobileConversation}
                aria-label="Back to conversations"
              >
                <BackIcon />
              </button>
              <div
                class="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-600 text-xs font-semibold tracking-wide text-white shadow-sm"
                aria-hidden="true"
              >
                {conversationInitials(conversation)}
              </div>
              <div class="min-w-0 grow">
                <h2 class="truncate font-semibold text-slate-800">{conversationTitle(conversation)}</h2>
                <p class="truncate text-xs text-slate-500">
                  {formatPhoneNumber(conversation.contactPhoneNumber)} · via{" "}
                  {formatPhoneNumber(conversation.tenantPhoneNumber)}
                </p>
              </div>
            </header>

            <div ref={messagesElement} class="chat-wallpaper min-h-0 grow overflow-y-auto overscroll-contain py-3">
              <Show
                when={!conversationState.loadingMessages}
                fallback={
                  <div class="flex h-full items-center justify-center" aria-label="Loading messages">
                    <div class="rounded-full bg-white/90 px-4 py-2 text-sm text-slate-500 shadow-sm">
                      Loading messages…
                    </div>
                  </div>
                }
              >
                <Show
                  when={conversationState.messages.length > 0}
                  fallback={
                    <div class="flex h-full min-h-64 items-center justify-center px-6">
                      <div class="bg-amber-50/95 text-amber-950 max-w-sm rounded-xl px-4 py-3 text-center text-sm shadow-sm">
                        This is the beginning of your conversation with {conversationTitle(conversation)}. Messages are
                        sent from {formatPhoneNumber(conversation.tenantPhoneNumber)}.
                      </div>
                    </div>
                  }
                >
                  <Show when={conversationState.hasOlderMessages}>
                    <div class="mb-3 text-center">
                      <button
                        class="rounded-full bg-white/90 px-4 py-1.5 text-xs font-medium text-sky-700 shadow-sm hover:cursor-pointer hover:bg-white disabled:text-slate-400"
                        type="button"
                        disabled={conversationState.loadingOlderMessages}
                        onClick={() => void loadOlder()}
                      >
                        {conversationState.loadingOlderMessages ? "Loading…" : "Load earlier messages"}
                      </button>
                    </div>
                  </Show>
                  <div class="space-y-3 pb-1">
                    <For each={groups()}>
                      {(group) => (
                        <>
                          <div class="pointer-events-none sticky top-2 z-10 my-3 flex justify-center">
                            <time
                              class="rounded-lg bg-white/90 px-3 py-1 text-[0.68rem] font-medium tracking-wide text-slate-500 uppercase shadow-sm"
                              datetime={group.key}
                            >
                              {group.label}
                            </time>
                          </div>
                          <For each={group.messages}>{(message) => <MessageBubble message={message} />}</For>
                        </>
                      )}
                    </For>
                  </div>
                </Show>
              </Show>
            </div>

            <Show when={conversationState.messageError}>
              {(error) => (
                <div
                  class="bg-rose-50 border-t border-rose-100 px-4 py-2 text-center text-xs font-medium text-rose-700"
                  role="alert"
                >
                  {error()}
                </div>
              )}
            </Show>
            <MessageComposer />
          </>
        )}
      </Show>
    </section>
  );
}

function MessageComposer() {
  let textareaElement: HTMLTextAreaElement | undefined;

  async function submit(): Promise<void> {
    const sent = await sendConversationMessage();
    if (sent && textareaElement) textareaElement.style.height = "auto";
  }

  function resize(textarea: HTMLTextAreaElement): void {
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`;
  }

  return (
    <div class="border-t border-slate-200/80 bg-slate-100/95 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-3">
      <form
        class="flex items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <label class="min-w-0 grow">
          <span class="sr-only">Type a message</span>
          <textarea
            ref={textareaElement}
            id="conversation-message-composer"
            class="block max-h-32 min-h-11 w-full resize-none overflow-y-auto rounded-2xl border border-white bg-white px-4 py-2.5 text-[0.95rem] leading-6 text-slate-800 shadow-sm outline-none placeholder:text-slate-400 focus:border-sky-300 focus:ring-2 focus:ring-sky-500/20 disabled:opacity-70"
            rows="1"
            value={conversationState.draft}
            placeholder="Type a message"
            maxlength={5000}
            enterkeyhint="send"
            disabled={conversationState.sending}
            onInput={(event) => {
              updateConversationDraft(event.currentTarget.value);
              resize(event.currentTarget);
            }}
            onKeyDown={(event) => {
              if (event.key !== "Enter" || event.shiftKey || event.isComposing) return;
              event.preventDefault();
              void submit();
            }}
          />
        </label>
        <button
          type="submit"
          class="flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm transition hover:cursor-pointer hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={!conversationState.draft.trim() || conversationState.sending}
          aria-label="Send message"
        >
          <Show when={!conversationState.sending} fallback={<SpinnerIcon />}>
            <SendIcon />
          </Show>
        </button>
      </form>
    </div>
  );
}

function EmptyThread() {
  return (
    <div class="chat-wallpaper flex h-full items-center justify-center px-8 text-center">
      <div class="max-w-md">
        <div class="mx-auto mb-5 flex size-20 items-center justify-center rounded-full bg-white/80 shadow-sm">
          <ChatIcon />
        </div>
        <h2 class="text-xl font-semibold text-slate-700">Your conversations</h2>
        <p class="mt-2 text-sm leading-6 text-slate-500">
          Select a chat to read messages and reply from your business number.
        </p>
      </div>
    </div>
  );
}

function BackIcon() {
  return (
    <svg class="size-5 fill-none stroke-slate-600" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 18-6-6 6-6" stroke-width="2" stroke-linecap="round" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg class="size-10 fill-none stroke-emerald-600" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 11.5a8 8 0 0 1-11.7 7.1L4 20l1.4-4.1A8 8 0 1 1 20 11.5Z" stroke-width="1.6" />
      <path d="M8 10h8M8 14h5" stroke-width="1.6" stroke-linecap="round" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg class="size-5 animate-spin fill-none stroke-white" viewBox="0 0 24 24" aria-hidden="true">
      <circle class="opacity-30" cx="12" cy="12" r="9" stroke-width="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke-width="3" stroke-linecap="round" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg class="size-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3.5 4.5 21 12 3.5 19.5l2-6L15 12l-9.5-1.5-2-6Z" />
    </svg>
  );
}

function groupMessagesByDay(messages: ChatMessage[]): MessageGroup[] {
  const groups = new Map<string, ChatMessage[]>();
  for (const message of messages) {
    const date = new Date(messageTimestamp(message));
    const key = Number.isNaN(date.getTime()) ? "unknown" : localDateKey(date);
    groups.set(key, [...(groups.get(key) ?? []), message]);
  }
  return [...groups].map(([key, groupedMessages]) => ({ key, label: dateLabel(key), messages: groupedMessages }));
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
