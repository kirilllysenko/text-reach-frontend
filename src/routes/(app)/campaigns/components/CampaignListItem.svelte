<script lang="ts">
  import CampaignStatusBadge from "./CampaignStatusBadge.svelte";
  import type { CampaignViewModel } from "$lib/features/campaigns/campaigns-view-data";

  interface Props {
    campaign: CampaignViewModel;
    compact?: boolean;
    mobile?: boolean;
    selected?: boolean;
    onSelect?: (campaignId: string) => void;
  }

  let { campaign, compact = false, mobile = false, selected = false, onSelect }: Props = $props();

  const createdAtLabel = $derived(
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(campaign.createdAt),
  );
</script>

<button
  class={[
    `w-full cursor-pointer rounded-xl border p-3 text-left shadow-sm backdrop-blur-sm
      transition-colors`,
    selected ? "border-sky-300/80 bg-sky-50/80" : "border-white/75 bg-white/75 hover:bg-white/90",
  ]}
  type="button"
  onclick={() => onSelect?.(campaign.id)}
>
  <div class="flex items-start gap-2">
    <div class="min-w-0 grow">
      <p class="truncate font-medium text-slate-800">{campaign.name}</p>

      <div class="mt-1">
        <CampaignStatusBadge status={campaign.status} />
      </div>

      {#if compact}
        <p class="mt-2 text-xs text-slate-500">Created: {createdAtLabel}</p>
      {:else}
        <div class="mt-2 grid grid-cols-2 gap-1 text-xs text-slate-500">
          <span>Created: {createdAtLabel}</span>
          <span>Sent: {campaign.sentMessageCount}</span>
          <span>Contacts: {campaign.messageCount}</span>
          <span>From: {campaign.fromPhoneNumber}</span>
        </div>
      {/if}
    </div>

    {#if mobile}
      <span class="pt-1 text-sm text-slate-500">›</span>
    {/if}
  </div>
</button>
