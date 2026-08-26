import { For, Show } from "solid-js";
import type { ChatMessage } from "~/lib/feature/conversation/conversation-view-data";
import { messageTimestamp } from "~/lib/feature/conversation/conversation-view-data";
import { classes } from "~/lib/styles/classes";

const timeFormatter = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });

export function MessageBubble(props: { message: ChatMessage }) {
  const outgoing = () => props.message.direction === "OUTBOUND";
  return (
    <article
      class={classes(["flex px-3 sm:px-6", outgoing() ? "justify-end" : "justify-start"])}
      data-testid="message"
      data-message-id={props.message.id}
      data-direction={props.message.direction}
      data-status={props.message.status}
    >
      <div
        class={classes([
          `relative max-w-[88%] rounded-xl px-2.5 pt-2 pb-1 shadow-[0_1px_2px_rgba(15,23,42,0.15)] sm:max-w-[72%]`,
          outgoing() ? "rounded-tr-sm bg-emerald-100 text-slate-800" : "rounded-tl-sm bg-white text-slate-800",
        ])}
      >
        <Show when={props.message.campaign}>
          {(campaign) => (
            <div class="mb-1 border-l-3 border-sky-500 pl-2 text-xs leading-tight text-slate-500">
              <span class="block font-semibold text-sky-700">Campaign</span>
              <span class="line-clamp-1">{campaign().name}</span>
            </div>
          )}
        </Show>
        <Show when={props.message.media.length > 0}>
          <div
            class={classes([
              "mb-1 grid gap-1 overflow-hidden rounded-lg",
              props.message.media.length > 1 && "grid-cols-2",
            ])}
          >
            <For each={props.message.media}>
              {(media, index) => (
                <Show
                  when={media.contentType.startsWith("image/")}
                  fallback={
                    <a
                      class="text-sky-800 flex min-h-16 items-center gap-2 rounded-lg bg-white/60 p-3 text-sm font-medium underline"
                      href={media.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <AttachmentIcon /> Open attachment
                    </a>
                  }
                >
                  <a href={media.url} target="_blank" rel="noreferrer" class="block bg-slate-100">
                    <img
                      class="max-h-80 min-h-32 w-full object-cover"
                      src={media.url}
                      alt={`Message attachment ${index() + 1}`}
                      loading="lazy"
                    />
                  </a>
                </Show>
              )}
            </For>
          </div>
        </Show>
        <div class="flex items-end gap-2">
          <Show when={props.message.text}>
            <p class="min-w-0 text-[0.94rem] leading-[1.35] break-words whitespace-pre-wrap">{props.message.text}</p>
          </Show>
          <span class="ml-auto flex shrink-0 items-center gap-0.5 self-end pl-1 text-[0.63rem] leading-4 text-slate-500">
            <time datetime={messageTimestamp(props.message)}>{formatMessageTime(messageTimestamp(props.message))}</time>
            <Show when={outgoing()}>{statusIcon(props.message.status)}</Show>
          </span>
        </div>
      </div>
    </article>
  );
}

function statusIcon(status: ChatMessage["status"]) {
  if (status === "PENDING") {
    return (
      <svg class="size-3.5 fill-none stroke-slate-400" viewBox="0 0 24 24" aria-label="Pending">
        <circle cx="12" cy="12" r="8" stroke-width="2" />
        <path d="M12 7v5l3 2" stroke-width="2" stroke-linecap="round" />
      </svg>
    );
  }
  if (status === "FAILED") {
    return (
      <svg class="size-3.5 fill-rose-500" viewBox="0 0 24 24" aria-label="Failed">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v7m0 4h.01" class="stroke-white" stroke-width="2" stroke-linecap="round" />
      </svg>
    );
  }
  if (status === "SENT") {
    return (
      <svg class="h-3.5 w-5 fill-none stroke-sky-500" viewBox="0 0 28 18" aria-label="Sent">
        <path d="m2 9 4 4L15 4M11 12l2 2L26 2" stroke-width="2" stroke-linecap="round" />
      </svg>
    );
  }
  return (
    <svg class="size-3.5 fill-none stroke-slate-400" viewBox="0 0 20 18" aria-label="Queued">
      <path d="m2 9 4 4L17 2" stroke-width="2" stroke-linecap="round" />
    </svg>
  );
}

function AttachmentIcon() {
  return (
    <svg class="size-5 shrink-0 fill-none stroke-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" stroke-width="2" stroke-linecap="round" />
    </svg>
  );
}

function formatMessageTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : timeFormatter.format(date);
}
