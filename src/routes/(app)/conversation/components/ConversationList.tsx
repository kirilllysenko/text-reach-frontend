import { For, Show } from "solid-js";
import { VList } from "virtua/solid";
import type { ConversationViewModel } from "~/lib/feature/conversation/conversation-view-data";
import {
  conversationInitials,
  conversationPreview,
  conversationTitle,
} from "~/lib/feature/conversation/conversation-view-data";
import { classes } from "~/lib/styles/classes";
import {
  conversationState,
  filteredConversations,
  loadConversations,
  loadMoreConversations,
  selectConversation,
  updateConversationSearch,
} from "~/lib/state/conversation";

const sameDayFormatter = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });
const weekFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });
const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "numeric", day: "numeric", year: "2-digit" });

export function ConversationList() {
  return (
    <aside class="flex h-full min-h-0 flex-col bg-white" aria-label="Conversations">
      <header class="border-b border-slate-100 bg-white px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 sm:px-4 sm:pt-4">
        <div class="mb-3 flex items-center gap-2 pl-10 sm:pl-0">
          <h1 class="min-w-0 grow text-xl font-bold text-slate-800">Chats</h1>
          <span
            class="flex items-center gap-1.5 text-xs text-slate-500"
            title={conversationState.realtimeConnected ? "Live updates connected" : "Reconnecting"}
            data-testid="live-update-status"
            data-connected={conversationState.realtimeConnected}
          >
            <span
              class={classes([
                "size-2 rounded-full",
                conversationState.realtimeConnected ? "bg-emerald-500" : "bg-amber-400 animate-pulse",
              ])}
            />
            <span class="sr-only">{conversationState.realtimeConnected ? "Live" : "Reconnecting"}</span>
          </span>
        </div>
        <label class="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 focus-within:ring-2 focus-within:ring-sky-500/30">
          <SearchIcon />
          <span class="sr-only">Search conversations</span>
          <input
            class="min-w-0 grow bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            type="search"
            value={conversationState.search}
            onInput={(event) => updateConversationSearch(event.currentTarget.value)}
            placeholder="Search chats"
          />
        </label>
      </header>

      <Show when={conversationState.listError}>
        {(error) => (
          <div class="bg-amber-50 text-amber-900 mx-3 mt-3 rounded-xl border border-amber-200 px-3 py-2 text-sm">
            <p>{error()}</p>
            <button
              class="text-amber-950 mt-1 font-semibold underline hover:cursor-pointer"
              type="button"
              onClick={() => void loadConversations()}
            >
              Try again
            </button>
          </div>
        )}
      </Show>

      <div class="min-h-0 grow">
        <Show when={!conversationState.loading} fallback={<ConversationSkeleton />}>
          <Show
            when={filteredConversations().length > 0}
            fallback={
              <div class="flex h-full min-h-56 flex-col items-center justify-center px-8 text-center">
                <div class="mb-3 flex size-14 items-center justify-center rounded-full bg-slate-100">
                  <ChatIcon />
                </div>
                <p class="font-medium text-slate-700">
                  {conversationState.search ? "No matching chats" : "No conversations yet"}
                </p>
                <p class="mt-1 text-sm text-slate-500">
                  {conversationState.search
                    ? "Try a name or phone number."
                    : "New replies and campaign conversations will appear here."}
                </p>
              </div>
            }
          >
            <VList data={filteredConversations()} style={{ height: "100%" }} itemSize={73}>
              {(conversation) => <ConversationListItem conversation={conversation} />}
            </VList>
          </Show>
        </Show>
      </div>

      <Show when={conversationState.hasMoreConversations && !conversationState.search}>
        <div class="border-t border-slate-100 p-2 text-center">
          <button
            type="button"
            class="rounded-full px-4 py-2 text-sm font-medium text-sky-700 hover:cursor-pointer hover:bg-sky-50"
            disabled={conversationState.loadingMoreConversations}
            onClick={() => void loadMoreConversations()}
          >
            {conversationState.loadingMoreConversations ? "Loading…" : "Load more chats"}
          </button>
        </div>
      </Show>
    </aside>
  );
}

function ConversationListItem(props: { conversation: ConversationViewModel }) {
  const selected = () => props.conversation.id === conversationState.selectedConversationId;
  return (
    <button
      id={`conversation-list-item-${props.conversation.id}`}
      type="button"
      class={classes([
        `group flex w-full items-center gap-3 border-b border-slate-100 px-3 py-3 text-left transition-colors hover:cursor-pointer hover:bg-slate-50 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-sky-500`,
        selected() && "bg-sky-50/90 hover:bg-sky-50",
      ])}
      onClick={() => void selectConversation(props.conversation.id)}
      aria-current={selected() ? "true" : undefined}
      data-testid="conversation-item"
      data-conversation-id={props.conversation.id}
      data-contact-id={props.conversation.contact.id}
      data-contact-phone={props.conversation.contactPhoneNumber}
    >
      <div
        class={classes([
          `flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold tracking-wide text-white shadow-sm`,
          selected()
            ? "from-sky-500 to-cyan-600"
            : "from-slate-400 to-slate-600 group-hover:from-sky-500 group-hover:to-cyan-600",
        ])}
        aria-hidden="true"
      >
        {conversationInitials(props.conversation)}
      </div>
      <div class="min-w-0 grow">
        <div class="mb-0.5 flex items-center gap-2">
          <span
            class={classes([
              "min-w-0 grow truncate text-[0.95rem] text-slate-800",
              props.conversation.unreadCount > 0 && "font-semibold",
            ])}
          >
            {conversationTitle(props.conversation)}
          </span>
          <time
            datetime={props.conversation.updatedAt}
            class={classes([
              "shrink-0 text-[0.69rem]",
              props.conversation.unreadCount > 0 ? "font-semibold text-emerald-600" : "text-slate-400",
            ])}
          >
            {formatConversationTime(props.conversation.updatedAt)}
          </time>
        </div>
        <div class="flex items-center gap-2">
          <p
            class={classes([
              "min-w-0 grow truncate text-sm",
              props.conversation.unreadCount > 0 ? "font-medium text-slate-700" : "text-slate-500",
            ])}
          >
            {conversationPreview(props.conversation)}
          </p>
          <Show when={props.conversation.unreadCount > 0}>
            <span
              class="flex min-w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 px-1.5 py-0.5 text-[0.65rem] font-bold text-white shadow-sm"
              aria-label={`${props.conversation.unreadCount} unread messages`}
            >
              {props.conversation.unreadCount > 99 ? "99+" : props.conversation.unreadCount}
            </span>
          </Show>
        </div>
      </div>
    </button>
  );
}

function ConversationSkeleton() {
  return (
    <div class="space-y-px" aria-label="Loading conversations">
      <For each={Array.from({ length: 7 })}>
        {() => (
          <div class="flex items-center gap-3 px-3 py-3">
            <div class="skeleton-loading size-12 shrink-0 rounded-full" />
            <div class="grow space-y-2">
              <div class="skeleton-loading h-4 w-2/3 rounded" />
              <div class="skeleton-loading h-3 w-5/6 rounded" />
            </div>
          </div>
        )}
      </For>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg class="size-4 shrink-0 fill-none stroke-slate-500" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke-width="2" />
      <path d="m20 20-3.6-3.6" stroke-width="2" stroke-linecap="round" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg class="size-7 fill-none stroke-slate-400" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h9a4 4 0 0 1 4 4Z" stroke-width="1.8" />
    </svg>
  );
}

function formatConversationTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return sameDayFormatter.format(date);
  const difference = Math.floor((startOfDay(now).getTime() - startOfDay(date).getTime()) / 86_400_000);
  return difference < 7 ? weekFormatter.format(date) : dateFormatter.format(date);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
