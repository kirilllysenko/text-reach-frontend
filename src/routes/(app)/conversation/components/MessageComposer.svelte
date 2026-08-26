<script lang="ts">
  import { getConversationState } from "./conversation-state.svelte";

  const conversationState = getConversationState();
  let textareaElement = $state<HTMLTextAreaElement>();

  async function submit(): Promise<void> {
    const sent = await conversationState.sendMessage();
    if (sent) resetTextarea();
  }

  function handleInput(event: Event): void {
    const textarea = event.currentTarget as HTMLTextAreaElement;
    conversationState.updateDraft(textarea.value);
    resizeTextarea(textarea);
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key !== "Enter" || event.shiftKey || event.isComposing) return;
    event.preventDefault();
    void submit();
  }

  function resizeTextarea(textarea: HTMLTextAreaElement): void {
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`;
  }

  function resetTextarea(): void {
    if (textareaElement) textareaElement.style.height = "auto";
  }
</script>

<div
  class="border-t border-slate-200/80 bg-slate-100/95 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-3"
>
  <form
    class="flex items-end gap-2"
    onsubmit={(event) => {
      event.preventDefault();
      void submit();
    }}
  >
    <label class="min-w-0 grow">
      <span class="sr-only">Type a message</span>
      <textarea
        bind:this={textareaElement}
        id="conversation-message-composer"
        class="block max-h-32 min-h-11 w-full resize-none overflow-y-auto rounded-2xl border border-white bg-white px-4 py-2.5
          text-[0.95rem] leading-6 text-slate-800 shadow-sm outline-none placeholder:text-slate-400 focus:border-sky-300
          focus:ring-2 focus:ring-sky-500/20 disabled:opacity-70"
        rows="1"
        value={conversationState.draft}
        placeholder="Type a message"
        maxlength="5000"
        enterkeyhint="send"
        disabled={conversationState.sending}
        oninput={handleInput}
        onkeydown={handleKeydown}
      ></textarea>
    </label>

    <button
      type="submit"
      class="flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm transition
        hover:cursor-pointer hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500
        disabled:cursor-not-allowed disabled:bg-slate-300"
      disabled={!conversationState.draft.trim() || conversationState.sending}
      aria-label="Send message"
    >
      {#if conversationState.sending}
        <svg class="size-5 animate-spin fill-none stroke-white" viewBox="0 0 24 24" aria-hidden="true">
          <circle class="opacity-30" cx="12" cy="12" r="9" stroke-width="3"></circle>
          <path d="M21 12a9 9 0 0 0-9-9" stroke-width="3" stroke-linecap="round"></path>
        </svg>
      {:else}
        <svg class="size-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3.5 4.5 21 12 3.5 19.5l2-6L15 12l-9.5-1.5-2-6Z"></path>
        </svg>
      {/if}
    </button>
  </form>
</div>
