<script lang="ts" module>
  const timeFormatter = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });

  function formatMessageTime(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : timeFormatter.format(date);
  }
</script>

<script lang="ts">
  import type { ChatMessage } from "./conversation-view-data";
  import { messageTimestamp } from "./conversation-view-data";

  interface Props {
    message: ChatMessage;
  }

  let { message }: Props = $props();

  const outgoing = $derived(message.direction === "OUTBOUND");
  const time = $derived(formatMessageTime(messageTimestamp(message)));
</script>

<article
  class={["flex px-3 sm:px-6", outgoing ? "justify-end" : "justify-start"]}
  data-testid="message"
  data-message-id={message.id}
  data-direction={message.direction}
  data-status={message.status}
>
  <div
    class={[
      `relative max-w-[88%] rounded-xl px-2.5 pt-2 pb-1 shadow-[0_1px_2px_rgba(15,23,42,0.15)]
        sm:max-w-[72%]`,
      outgoing ? "rounded-tr-sm bg-emerald-100 text-slate-800" : "rounded-tl-sm bg-white text-slate-800",
    ]}
  >
    {#if message.campaign}
      <div class="mb-1 border-l-3 border-sky-500 pl-2 text-xs leading-tight text-slate-500">
        <span class="block font-semibold text-sky-700">Campaign</span>
        <span class="line-clamp-1">{message.campaign.name}</span>
      </div>
    {/if}

    {#if message.media.length > 0}
      <div class={["mb-1 grid gap-1 overflow-hidden rounded-lg", message.media.length > 1 && "grid-cols-2"]}>
        {#each message.media as media, index (`${message.id}-${media.url}-${index}`)}
          {#if media.contentType.startsWith("image/")}
            <a href={media.url} target="_blank" rel="noreferrer" class="block bg-slate-100">
              <img
                class="max-h-80 min-h-32 w-full object-cover"
                src={media.url}
                alt={`Message attachment ${index + 1}`}
                loading="lazy"
              />
            </a>
          {:else}
            <a
              class="text-sky-800 flex min-h-16 items-center gap-2 rounded-lg bg-white/60 p-3 text-sm font-medium underline"
              href={media.url}
              target="_blank"
              rel="noreferrer"
            >
              <svg class="size-5 shrink-0 fill-none stroke-current" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>
              </svg>
              Open attachment
            </a>
          {/if}
        {/each}
      </div>
    {/if}

    <div class="flex items-end gap-2">
      {#if message.text}
        <p class="min-w-0 text-[0.94rem] leading-[1.35] break-words whitespace-pre-wrap">{message.text}</p>
      {/if}
      <span class="ml-auto flex shrink-0 items-center gap-0.5 self-end pl-1 text-[0.63rem] leading-4 text-slate-500">
        <time datetime={messageTimestamp(message)}>{time}</time>
        {#if outgoing}
          {#if message.status === "PENDING"}
            <svg class="size-3.5 fill-none stroke-slate-400" viewBox="0 0 24 24" aria-label="Pending">
              <circle cx="12" cy="12" r="8" stroke-width="2"></circle>
              <path d="M12 7v5l3 2" stroke-width="2" stroke-linecap="round"></path>
            </svg>
          {:else if message.status === "FAILED"}
            <svg class="size-3.5 fill-rose-500" viewBox="0 0 24 24" aria-label="Failed">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 6v7m0 4h.01" class="stroke-white" stroke-width="2" stroke-linecap="round"></path>
            </svg>
          {:else if message.status === "SENT"}
            <svg class="h-3.5 w-5 fill-none stroke-sky-500" viewBox="0 0 28 18" aria-label="Sent">
              <path d="m2 9 4 4L15 4M11 12l2 2L26 2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              ></path>
            </svg>
          {:else}
            <svg class="size-3.5 fill-none stroke-slate-400" viewBox="0 0 20 18" aria-label="Queued">
              <path d="m2 9 4 4L17 2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          {/if}
        {/if}
      </span>
    </div>
  </div>
</article>
