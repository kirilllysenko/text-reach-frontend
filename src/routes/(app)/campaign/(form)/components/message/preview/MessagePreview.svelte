<script lang="ts">
  import { Card } from "$lib";
  import type { CampaignMediaDraft } from "../images/media";
  import { toPreviewText, type MessagePart } from "../message";

  interface Props {
    media: CampaignMediaDraft[];
    parts: MessagePart[];
    senderPhoneNumber?: string;
    visible?: boolean;
  }

  let { media, parts, senderPhoneNumber = "", visible = $bindable(true) }: Props = $props();

  const previewText = $derived(toPreviewText(parts).trim());
  const sender = $derived(senderPhoneNumber || "Sending number");
</script>

{#if visible}
  <aside class="min-w-0 lg:sticky lg:top-0 lg:self-start" aria-label="Message preview">
    <Card variant="panel" class="p-4 sm:p-5">
      <div class="mb-4 flex items-center justify-between gap-3">
        <h2 class="text-base font-semibold text-slate-800">Message preview</h2>
        <button
          type="button"
          class="flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-sky-700 hover:cursor-pointer hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-sky-500"
          onclick={() => (visible = false)}
        >
          <svg class="size-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M2 5.3 3.3 4 20 20.7 18.7 22l-3.1-3.1c-1.1.4-2.4.6-3.6.6-5 0-9.3-3.1-11-7.5.7-1.8 1.8-3.3 3.2-4.5L2 5.3Zm10 3.7a3 3 0 0 1 3 3c0 .4-.1.7-.2 1L11 9.2c.3-.1.7-.2 1-.2Zm0-4.5c5 0 9.3 3.1 11 7.5-.8 2.1-2.2 3.9-4 5.2l-1.4-1.4c1.4-.9 2.5-2.2 3.2-3.8A9.7 9.7 0 0 0 12 6.5c-1.1 0-2.2.2-3.2.5L7.3 5.5c1.4-.7 3-1 4.7-1."
            />
          </svg>
          Hide preview
        </button>
      </div>

      <div
        class="mx-auto flex aspect-[9/17] w-full max-w-66 flex-col overflow-hidden rounded-[2.75rem] border-[0.6rem] border-slate-900 bg-white shadow-xl"
      >
        <div
          class="relative flex h-15 shrink-0 items-end justify-center border-b border-slate-200 bg-slate-50 px-3 pb-3"
        >
          <div class="absolute top-0 left-1/2 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-slate-900"></div>
          <p class="max-w-full truncate text-xs font-semibold text-slate-800">{sender}</p>
        </div>

        <div class="min-h-0 grow overflow-y-auto bg-white p-3">
          {#if previewText || media.length > 0}
            <div class="max-w-[88%] rounded-2xl rounded-bl-md bg-slate-100 p-2.5 text-sm text-slate-800">
              {#if media[0]}
                <div class="relative mb-2 overflow-hidden rounded-xl">
                  <img class="aspect-square w-full object-cover" src={media[0].previewUrl} alt={media[0].filename} />
                  {#if media.length > 1}
                    <span class="bg-slate-950/75 absolute right-2 bottom-2 rounded-full px-2 py-1 text-xs text-white">
                      +{media.length - 1}
                    </span>
                  {/if}
                </div>
              {/if}
              <p class="break-words whitespace-pre-wrap">{previewText || "Image attachment"}</p>
            </div>
          {:else}
            <div class="flex h-full items-center justify-center px-5 text-center text-xs text-slate-400">
              Your message preview will appear here.
            </div>
          {/if}
        </div>
      </div>

      <p class="mt-4 text-center text-xs text-slate-500">
        Preview contact: <span class="font-semibold text-slate-700">Avery Johnson</span>
      </p>
    </Card>
  </aside>
{:else}
  <aside class="lg:sticky lg:top-0 lg:self-stretch" aria-label="Message preview hidden">
    <button
      type="button"
      class="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/80 bg-white/75 px-3 text-sm font-medium text-sky-700 shadow-sm hover:cursor-pointer hover:bg-white focus-visible:outline-2 focus-visible:outline-sky-500 lg:h-full lg:min-h-80 lg:w-14 lg:flex-col lg:px-2"
      onclick={() => (visible = true)}
    >
      <svg class="size-5 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 4.5C17 4.5 21.3 7.6 23 12c-1.7 4.4-6 7.5-11 7.5S2.7 16.4 1 12c1.7-4.4 6-7.5 11-7.5Zm0 2A9.7 9.7 0 0 0 3.2 12a9.7 9.7 0 0 0 8.8 5.5 9.7 9.7 0 0 0 8.8-5.5A9.7 9.7 0 0 0 12 6.5Zm0 2.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z"
        />
      </svg>
      <span class="lg:[writing-mode:vertical-rl]">Show preview</span>
    </button>
  </aside>
{/if}
