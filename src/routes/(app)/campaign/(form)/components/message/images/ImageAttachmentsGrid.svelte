<script lang="ts">
  import type { CampaignMediaDraft } from "./media";
  import ImageCard from "./ImageCard.svelte";

  interface Props {
    attachments: CampaignMediaDraft[];
    onPreview: (attachment: CampaignMediaDraft) => void;
    onRemove: (attachment: CampaignMediaDraft) => void;
  }

  let { attachments, onPreview, onRemove }: Props = $props();
</script>

<section class="mt-4 w-full" aria-labelledby="campaign-images-title">
  <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
    <h3 id="campaign-images-title" class="text-sm font-semibold text-slate-800">Images</h3>
    <span class="text-xs text-slate-500">{attachments.length} of 10</span>
    <span class="text-xs text-slate-400">JPEG, PNG, GIF, BMP or WebP</span>
  </div>

  {#if attachments.length > 0}
    <div class="mt-2 grid grid-cols-[repeat(auto-fill,7.5rem)] justify-start gap-3">
      {#each attachments as attachment (attachment.id)}
        <ImageCard {attachment} {onPreview} {onRemove} />
      {/each}
    </div>
  {:else}
    <p class="mt-2 text-xs text-slate-500">No images attached.</p>
  {/if}
</section>
