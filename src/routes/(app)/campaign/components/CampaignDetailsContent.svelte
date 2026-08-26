<script lang="ts">
  import { LinkButton } from "$lib";
  import { buildCampaignMessagesPath } from "$lib/app/paths";
  import CampaignActions from "./CampaignActions.svelte";
  import CampaignStatusBadge from "./CampaignStatusBadge.svelte";
  import { formatCampaignSchedule } from "./campaign-display";
  import type { CampaignStatus, CampaignViewModel } from "./campaign-view-data";

  interface Props {
    campaign?: CampaignViewModel;
    groupNames?: string[];
    mobile?: boolean;
    onStatusChanged: (campaignId: string, status: CampaignStatus) => void;
  }

  let { campaign, groupNames = [], mobile = false, onStatusChanged }: Props = $props();

  function percent(value: number, total: number): number {
    if (total <= 0) {
      return 0;
    }

    return (value / total) * 100;
  }

  const pendingPercent = $derived(campaign ? percent(campaign.pendingMessageCount, campaign.messageCount) : 0);
  const sentPercent = $derived(campaign ? percent(campaign.sentMessageCount, campaign.messageCount) : 0);
  const scheduledAt = $derived(formatCampaignSchedule(campaign?.scheduledAt ?? null));
</script>

{#if campaign}
  <div class={["space-y-3", !mobile && "space-y-4"]}>
    {#if !mobile}
      <div class="flex flex-wrap items-start justify-between gap-3 border-b border-white/70 pb-4">
        <h2 class="text-lg font-semibold text-slate-800 sm:text-xl">{campaign.name}</h2>
        <div class="flex flex-wrap items-center justify-end gap-2">
          <div class="flex items-center gap-2">
            <CampaignStatusBadge status={campaign.status} />
            <LinkButton class="text-sm" href={buildCampaignMessagesPath(campaign.id)}>View messages</LinkButton>
          </div>
          <CampaignActions {campaign} {onStatusChanged} />
        </div>
      </div>
    {/if}

    {#if mobile}
      <div class="flex flex-wrap items-center justify-end gap-2">
        <CampaignActions {campaign} {onStatusChanged} />
        <LinkButton class="text-sm" href={buildCampaignMessagesPath(campaign.id)}>View messages</LinkButton>
      </div>
    {/if}

    <section class={["grid grid-cols-1 gap-3", mobile ? "grid-cols-2" : "sm:grid-cols-3"]}>
      {#if scheduledAt}
        <div class="rounded-xl border border-white/80 bg-white/75 p-3 shadow-sm backdrop-blur-sm">
          <p class="text-xs text-slate-500">Scheduled for</p>
          <p class="text-violet-700 text-sm font-semibold">{scheduledAt}</p>
        </div>
      {/if}
      <div class="rounded-xl border border-white/80 bg-white/75 p-3 shadow-sm backdrop-blur-sm">
        <p class="text-xs text-slate-500">All messages</p>
        <p class="text-lg font-semibold text-slate-800">{campaign.messageCount}</p>
      </div>
      <div class="rounded-xl border border-white/80 bg-white/75 p-3 shadow-sm backdrop-blur-sm">
        <p class="text-xs text-slate-500">Pending messages</p>
        <p class="text-lg font-semibold text-sky-700">{campaign.pendingMessageCount}</p>
      </div>
      <div class="rounded-xl border border-white/80 bg-white/75 p-3 shadow-sm backdrop-blur-sm">
        <p class="text-xs text-slate-500">Sent messages</p>
        <p class="text-lg font-semibold text-emerald-600">{campaign.sentMessageCount}</p>
      </div>
    </section>

    <section
      class="rounded-xl border border-white/80 bg-gradient-to-r from-sky-50/80 via-white/80 to-stone-50/70 p-4
        shadow-sm backdrop-blur-sm"
    >
      <div
        class={["flex flex-wrap gap-3", mobile ? "items-center justify-between text-[11px]" : "items-center text-xs"]}
      >
        <span class="inline-flex items-center gap-1.5 text-slate-700">
          <span class="size-2.5 rounded-full bg-sky-500"></span>
          Pending: {campaign.pendingMessageCount} ({pendingPercent.toFixed(1)}%)
        </span>
        <span class="inline-flex items-center gap-1.5 text-slate-700">
          <span class="size-2.5 rounded-full bg-emerald-500"></span>
          Sent: {campaign.sentMessageCount} ({sentPercent.toFixed(1)}%)
        </span>
      </div>
      <div class="mt-3 h-6 w-full overflow-hidden rounded-full border border-white/80 bg-white/90 shadow-inner">
        <div class="flex h-full">
          <div class="h-full bg-sky-500" style={`width:${pendingPercent}%;`}></div>
          <div class="h-full bg-emerald-500" style={`width:${sentPercent}%;`}></div>
        </div>
      </div>
    </section>

    <section class={["grid grid-cols-1 gap-3", !mobile && "lg:grid-cols-2"]}>
      <div class="rounded-xl border border-white/80 bg-white/75 p-4 shadow-sm backdrop-blur-sm">
        <h3 class="mb-3 text-sm font-semibold text-slate-700">Audience</h3>
        <p class="mb-1 text-sm text-slate-500">Contact groups</p>
        <div class="flex flex-wrap gap-2">
          {#if groupNames.length > 0}
            {#each groupNames as groupName (groupName)}
              <span class="rounded-full border border-white/80 bg-white/80 px-2.5 py-1 text-xs text-slate-700">
                {groupName}
              </span>
            {/each}
          {:else}
            <span class="text-sm text-slate-500">No contact groups assigned</span>
          {/if}
        </div>
      </div>

      <div class="rounded-xl border border-white/80 bg-white/75 p-4 shadow-sm backdrop-blur-sm">
        <h3 class="mb-3 text-sm font-semibold text-slate-700">Message</h3>
        <div class="space-y-2 text-sm">
          <p>
            <span class="text-slate-500">Message template:</span>
            <span class="text-slate-800">{campaign.messageTemplate}</span>
          </p>
        </div>
      </div>
    </section>
  </div>
{:else}
  <div class="flex h-full min-h-80 items-center justify-center text-sm text-slate-500">
    Select a campaign to see details
  </div>
{/if}
