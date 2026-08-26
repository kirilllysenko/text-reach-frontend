<script lang="ts">
  import { onDestroy } from "svelte";
  import { phoneFilterState } from "$lib/state/phone-filter.svelte";
  import ConversationList from "./components/ConversationList.svelte";
  import { ConversationState } from "./components/conversation-state.svelte";
  import ConversationThread from "./components/ConversationThread.svelte";

  const state = new ConversationState(phoneFilterState.selectedPhoneId);

  $effect(() => {
    state.setPhoneFilter(phoneFilterState.selectedPhoneId);
  });

  onDestroy(state.dispose);
</script>

<div
  class="h-dvh min-h-0 overflow-hidden bg-white sm:h-[calc(100dvh-3rem)] sm:rounded-2xl sm:border sm:border-white/80
    sm:shadow-[0_20px_45px_-25px_rgba(30,41,59,0.45)]"
>
  <div class="grid h-full min-h-0 sm:grid-cols-[21rem_minmax(0,1fr)]">
    <div class={["min-h-0 border-r border-slate-200", state.mobileThreadOpen ? "hidden sm:block" : "block"]}>
      <ConversationList {state} />
    </div>

    <div class={["min-h-0", state.mobileThreadOpen ? "block" : "hidden sm:block"]}>
      <ConversationThread {state} />
    </div>
  </div>
</div>
