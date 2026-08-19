<script lang="ts">
  import { Button, ResponsiveDialog } from "$lib";
  import { messageDirectionLabelMap, formatMessageDate } from "../message-display";
  import { messageStatusLabelMap } from "../message-status";
  import type { MessageTableRow } from "./column.svelte";

  interface Props {
    message: MessageTableRow;
  }

  let { message }: Props = $props();
  let open = $state(false);

  const details = $derived([
    { label: "Status", value: messageStatusLabelMap[message.status] },
    { label: "Direction", value: messageDirectionLabelMap[message.direction] },
    { label: "Created", value: formatMessageDate(message.createdAt) },
    { label: "Sent", value: formatMessageDate(message.sentAt) },
    { label: "Received", value: formatMessageDate(message.receivedAt) },
    { label: "Tenant phone", value: message.tenantPhoneNumber },
    { label: "Message ID", value: message.id },
    { label: "Campaign ID", value: message.campaign?.id ?? "Not associated" },
    { label: "Contact ID", value: message.contact?.id ?? "Not associated" },
    { label: "Conversation ID", value: message.conversation.id },
    { label: "Tenant phone ID", value: message.tenantPhone.id },
  ]);

  function isImage(contentType: string): boolean {
    return contentType.startsWith("image/");
  }

  function formatMediaDetails(contentType: string, sizeBytes?: number | null): string {
    return typeof sizeBytes === "number" ? `${contentType} · ${sizeBytes.toLocaleString()} bytes` : contentType;
  }
</script>

<Button small variant="secondary" aria-label={`Inspect message ${message.id}`} onclick={() => (open = true)}>
  Inspect
</Button>

<ResponsiveDialog
  {open}
  title="Message details"
  description="Delivery, content, media, and identifiers for this message."
  onClose={() => (open = false)}
>
  <div class="space-y-6">
    <section>
      <h3 class="text-sm font-semibold text-slate-800">Message</h3>
      <p
        class="mt-2 rounded-xl border border-slate-200/80 bg-white/80 p-3 text-sm leading-6 break-words
          whitespace-pre-wrap text-slate-700"
      >
        {message.text || "No text content."}
      </p>
    </section>

    {#if message.media.length > 0}
      <section>
        <h3 class="text-sm font-semibold text-slate-800">Media ({message.media.length})</h3>

        <div class="mt-2 grid gap-3 sm:grid-cols-2">
          {#each message.media as media, index (`${message.id}-${media.url}-${index}`)}
            <a
              class="overflow-hidden rounded-xl border border-slate-200/80 bg-white/80 text-sm text-sky-700
                shadow-sm hover:bg-white"
              href={media.url}
              target="_blank"
              rel="noreferrer"
            >
              {#if isImage(media.contentType)}
                <img
                  class="h-40 w-full bg-slate-100 object-cover"
                  src={media.url}
                  alt={`Message attachment ${index + 1}`}
                  loading="lazy"
                />
              {/if}

              <span class="flex items-center justify-between gap-3 px-3 py-2">
                <span class="truncate">Attachment {index + 1}</span>
                <span class="shrink-0 text-xs text-slate-500">
                  {formatMediaDetails(media.contentType, media.sizeBytes)}
                </span>
              </span>
            </a>
          {/each}
        </div>
      </section>
    {/if}

    <section>
      <h3 class="text-sm font-semibold text-slate-800">Details</h3>

      <dl class="mt-2 grid gap-x-6 gap-y-4 rounded-xl border border-slate-200/80 bg-white/80 p-4 sm:grid-cols-2">
        {#each details as detail (detail.label)}
          <div class="min-w-0">
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">{detail.label}</dt>
            <dd class="mt-1 text-sm break-words text-slate-800">{detail.value}</dd>
          </div>
        {/each}
      </dl>
    </section>
  </div>
</ResponsiveDialog>
