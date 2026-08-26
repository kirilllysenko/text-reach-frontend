import { createEffect, onSettled } from "solid-js";
import { classes } from "~/lib/styles/classes";
import {
  conversationState,
  disposeConversations,
  initializeConversations,
  setConversationPhoneFilter,
} from "~/lib/state/conversation";
import { selectedPhoneId } from "~/lib/state/phone-filter";
import { ConversationList } from "./components/ConversationList";
import { ConversationThread } from "./components/ConversationThread";

export default function ConversationPage() {
  onSettled(() => {
    initializeConversations(selectedPhoneId());
    return disposeConversations;
  });

  createEffect(selectedPhoneId, (phoneId) => setConversationPhoneFilter(phoneId));

  return (
    <div class="h-dvh min-h-0 overflow-hidden bg-white sm:h-[calc(100dvh-3rem)] sm:rounded-2xl sm:border sm:border-white/80 sm:shadow-[0_20px_45px_-25px_rgba(30,41,59,0.45)]">
      <div class="grid h-full min-h-0 sm:grid-cols-[21rem_minmax(0,1fr)]">
        <div
          class={classes([
            "min-h-0 border-r border-slate-200",
            conversationState.mobileThreadOpen ? "hidden sm:block" : "block",
          ])}
        >
          <ConversationList />
        </div>
        <div class={classes(["min-h-0", conversationState.mobileThreadOpen ? "block" : "hidden sm:block"])}>
          <ConversationThread />
        </div>
      </div>
    </div>
  );
}
