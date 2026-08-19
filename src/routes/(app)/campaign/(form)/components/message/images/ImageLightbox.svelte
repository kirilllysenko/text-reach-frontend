<script lang="ts">
  import { onMount } from "svelte";
  import Close from "text-reach-frontend-library/icons/Close.svelte";
  import type { CampaignMediaDraft } from "./media";

  interface Props {
    attachment: CampaignMediaDraft;
    onClose: () => void;
  }

  let { attachment, onClose }: Props = $props();
  let closeButton = $state<HTMLButtonElement | null>(null);

  onMount(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  });

  function handleKeyDown(event: KeyboardEvent): void {
    if (event.key === "Escape") onClose();
  }

  function fileSize(sizeBytes: number): string {
    if (sizeBytes < 1024) return `${sizeBytes} B`;
    if (sizeBytes < 1024 * 1024) return `${Math.round(sizeBytes / 1024)} KB`;
    return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
  }
</script>

<svelte:window onkeydown={handleKeyDown} />

<div
  class="bg-slate-950/85 fixed inset-0 z-100 flex items-center justify-center p-4 backdrop-blur-sm sm:p-10"
  role="dialog"
  tabindex="-1"
  aria-modal="true"
  aria-label={`Preview ${attachment.filename}`}
>
  <button type="button" class="absolute inset-0 cursor-default" aria-label="Close image preview" onclick={onClose}
  ></button>

  <button
    bind:this={closeButton}
    type="button"
    class="absolute top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))] z-20 rounded-full border border-white/20 bg-slate-900/80 p-3 shadow-xl hover:cursor-pointer hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-white"
    aria-label="Close image preview"
    onclick={onClose}
  >
    <Close class="size-7 fill-white" />
  </button>

  <figure class="relative z-10 flex max-h-full max-w-full flex-col items-center gap-3">
    <img
      class="max-h-[calc(100dvh-8rem)] max-w-[min(90dvw,80rem)] rounded-2xl object-contain shadow-2xl"
      src={attachment.previewUrl}
      alt={attachment.filename}
    />
    <figcaption class="bg-slate-950/70 rounded-xl px-4 py-2 text-center text-white shadow-lg">
      <p class="text-sm font-medium">{attachment.filename}</p>
      <p class="text-xs text-slate-300">{fileSize(attachment.sizeBytes)}</p>
    </figcaption>
  </figure>
</div>
