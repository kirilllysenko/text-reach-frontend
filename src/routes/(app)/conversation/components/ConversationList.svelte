<script lang="ts">
  import Menu from "text-reach-frontend-library/icons/Menu.svelte";
  import { appShellState } from "text-reach-frontend-library/state/app-shell.svelte";
  import type { ConversationState } from "./conversation-state.svelte";
  import ConversationListItem from "./ConversationListItem.svelte";

  interface Props {
    state: ConversationState;
  }

  let { state }: Props = $props();
</script>

<aside class="flex h-full min-h-0 flex-col bg-white" aria-label="Conversations">
  <header
    class="border-b border-slate-100 bg-white px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 sm:px-4 sm:pt-4"
  >
    <div class="mb-3 flex items-center gap-2">
      <button
        class="rounded-full p-1.5 hover:cursor-pointer hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-sky-500 sm:hidden"
        type="button"
        onclick={() => appShellState.openSidebar()}
        aria-label="Open sidebar"
      >
        <Menu class="size-6 fill-slate-600" />
      </button>
      <h1 class="min-w-0 grow text-xl font-bold text-slate-800">Chats</h1>
      <span
        class="flex items-center gap-1.5 text-xs text-slate-500"
        title={state.realtimeConnected ? "Live updates connected" : "Reconnecting"}
        data-testid="live-update-status"
        data-connected={state.realtimeConnected}
      >
        <span class={["size-2 rounded-full", state.realtimeConnected ? "bg-emerald-500" : "bg-amber-400 animate-pulse"]}
        ></span>
        <span class="sr-only">{state.realtimeConnected ? "Live" : "Reconnecting"}</span>
      </span>
    </div>

    <label
      class="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 focus-within:ring-2 focus-within:ring-sky-500/30"
    >
      <svg class="size-4 shrink-0 fill-none stroke-slate-500" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7" stroke-width="2"></circle>
        <path d="m20 20-3.6-3.6" stroke-width="2" stroke-linecap="round"></path>
      </svg>
      <span class="sr-only">Search conversations</span>
      <input
        class="min-w-0 grow bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        type="search"
        value={state.search}
        oninput={(event) => state.updateSearch(event.currentTarget.value)}
        placeholder="Search chats"
      />
    </label>
  </header>

  {#if state.listError}
    <div class="bg-amber-50 text-amber-900 mx-3 mt-3 rounded-xl border border-amber-200 px-3 py-2 text-sm">
      <p>{state.listError}</p>
      <button
        class="text-amber-950 mt-1 font-semibold underline hover:cursor-pointer"
        type="button"
        onclick={state.retry}
      >
        Try again
      </button>
    </div>
  {/if}

  <div class="min-h-0 grow overflow-y-auto overscroll-contain">
    {#if state.loading}
      <div class="space-y-px" aria-label="Loading conversations">
        {#each Array(7) as _}
          <div class="flex items-center gap-3 px-3 py-3">
            <div class="skeleton-loading size-12 shrink-0 rounded-full"></div>
            <div class="grow space-y-2">
              <div class="skeleton-loading h-4 w-2/3 rounded"></div>
              <div class="skeleton-loading h-3 w-5/6 rounded"></div>
            </div>
          </div>
        {/each}
      </div>
    {:else if state.filteredConversations.length === 0}
      <div class="flex h-full min-h-56 flex-col items-center justify-center px-8 text-center">
        <div class="mb-3 flex size-14 items-center justify-center rounded-full bg-slate-100">
          <svg class="size-7 fill-none stroke-slate-400" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M20 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h9a4 4 0 0 1 4 4Z"
              stroke-width="1.8"
              stroke-linejoin="round"
            ></path>
          </svg>
        </div>
        <p class="font-medium text-slate-700">{state.search ? "No matching chats" : "No conversations yet"}</p>
        <p class="mt-1 text-sm text-slate-500">
          {state.search ? "Try a name or phone number." : "New replies and campaign conversations will appear here."}
        </p>
      </div>
    {:else}
      {#each state.filteredConversations as conversation (conversation.id)}
        <ConversationListItem
          {conversation}
          selected={conversation.id === state.selectedConversationId}
          onSelect={state.selectConversation}
        />
      {/each}

      {#if state.hasMoreConversations && !state.search}
        <div class="p-3 text-center">
          <button
            type="button"
            class="rounded-full px-4 py-2 text-sm font-medium text-sky-700 hover:cursor-pointer hover:bg-sky-50"
            disabled={state.loadingMoreConversations}
            onclick={state.loadMoreConversations}
          >
            {state.loadingMoreConversations ? "Loading…" : "Load more chats"}
          </button>
        </div>
      {/if}
    {/if}
  </div>
</aside>
