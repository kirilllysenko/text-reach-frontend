<script lang="ts">
  import Close from "text-reach-frontend-library/icons/Close.svelte";
  import type { CampaignMediaDraft } from "./media";

  interface Props {
    attachment: CampaignMediaDraft;
    onPreview: (attachment: CampaignMediaDraft) => void;
    onRemove: (attachment: CampaignMediaDraft) => void;
  }

  let { attachment, onPreview, onRemove }: Props = $props();

  function fileSize(sizeBytes: number): string {
    if (sizeBytes < 1024) return `${sizeBytes} B`;
    if (sizeBytes < 1024 * 1024) return `${Math.round(sizeBytes / 1024)} KB`;
    return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
  }
</script>

<article class="relative w-30 rounded-xl border border-white/80 bg-white/80 p-1.5 shadow-sm">
  <button
    type="button"
    class="group block aspect-square w-full overflow-hidden rounded-lg bg-slate-100 focus-visible:outline-2 focus-visible:outline-sky-500"
    aria-label={`Preview ${attachment.filename}`}
    onclick={() => onPreview(attachment)}
  >
    <img
      class="size-full object-cover transition-transform duration-200 group-hover:scale-105"
      src={attachment.previewUrl}
      alt={attachment.filename}
    />
  </button>

  <button
    type="button"
    class="absolute -top-2 -right-2 rounded-full border border-white/90 bg-white p-1 shadow-md hover:cursor-pointer hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-sky-500"
    aria-label={`Remove ${attachment.filename}`}
    onclick={() => onRemove(attachment)}
  >
    <Close class="size-4 fill-slate-600" />
  </button>

  <div class="min-w-0 px-1 pt-1.5">
    <p class="truncate text-xs font-medium text-slate-700" title={attachment.filename}>{attachment.filename}</p>
    <p class="text-xs text-slate-500">{fileSize(attachment.sizeBytes)}</p>
  </div>
</article>
