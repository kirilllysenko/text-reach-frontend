<script lang="ts" module>
  const sameDayFormatter = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });
  const weekFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });
  const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "numeric", day: "numeric", year: "2-digit" });

  function formatConversationTime(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const now = new Date();
    if (date.toDateString() === now.toDateString()) return sameDayFormatter.format(date);

    const dayDifference = Math.floor((startOfDay(now).getTime() - startOfDay(date).getTime()) / 86_400_000);
    return dayDifference < 7 ? weekFormatter.format(date) : dateFormatter.format(date);
  }

  function startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
</script>

<script lang="ts">
  import {
    conversationInitials,
    conversationPreview,
    conversationTitle,
    type ConversationViewModel,
  } from "./conversation-view-data";

  interface Props {
    conversation: ConversationViewModel;
    selected?: boolean;
    onSelect: (conversationId: string) => void;
  }

  let { conversation, selected = false, onSelect }: Props = $props();

  const title = $derived(conversationTitle(conversation));
  const preview = $derived(conversationPreview(conversation));
  const initials = $derived(conversationInitials(conversation));
  const time = $derived(formatConversationTime(conversation.updatedAt));
</script>

<button
  id={`conversation-list-item-${conversation.id}`}
  type="button"
  class={[
    `group flex w-full items-center gap-3 border-b border-slate-100 px-3 py-3 text-left
      transition-colors hover:cursor-pointer hover:bg-slate-50 focus-visible:z-10 focus-visible:outline-2
      focus-visible:outline-sky-500`,
    selected && "bg-sky-50/90 hover:bg-sky-50",
  ]}
  onclick={() => onSelect(conversation.id)}
  aria-current={selected ? "true" : undefined}
  data-testid="conversation-item"
  data-conversation-id={conversation.id}
  data-contact-id={conversation.contact.id}
  data-contact-phone={conversation.contactPhoneNumber}
>
  <div
    class={[
      `flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm
        font-semibold tracking-wide text-white shadow-sm`,
      selected
        ? "from-sky-500 to-cyan-600"
        : "from-slate-400 to-slate-600 group-hover:from-sky-500 group-hover:to-cyan-600",
    ]}
    aria-hidden="true"
  >
    {initials}
  </div>

  <div class="min-w-0 grow">
    <div class="mb-0.5 flex items-center gap-2">
      <span
        class={["min-w-0 grow truncate text-[0.95rem] text-slate-800", conversation.unreadCount > 0 && "font-semibold"]}
      >
        {title}
      </span>
      <time
        datetime={conversation.updatedAt}
        class={[
          "shrink-0 text-[0.69rem]",
          conversation.unreadCount > 0 ? "font-semibold text-emerald-600" : "text-slate-400",
        ]}
      >
        {time}
      </time>
    </div>

    <div class="flex items-center gap-2">
      <p
        class={[
          "min-w-0 grow truncate text-sm",
          conversation.unreadCount > 0 ? "font-medium text-slate-700" : "text-slate-500",
        ]}
      >
        {preview}
      </p>
      {#if conversation.unreadCount > 0}
        <span
          class="flex min-w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 px-1.5 py-0.5 text-[0.65rem]
            font-bold text-white shadow-sm"
          aria-label={`${conversation.unreadCount} unread messages`}
        >
          {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
        </span>
      {/if}
    </div>
  </div>
</button>
