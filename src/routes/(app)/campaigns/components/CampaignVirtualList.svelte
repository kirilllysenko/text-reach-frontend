<script lang="ts">
  import { VirtualList } from "svelte-virtuallists";
  import CampaignListItem from "./CampaignListItem.svelte";
  import type { CampaignViewModel } from "$lib/features/campaigns/campaigns-view-data";

  interface Props {
    campaigns: CampaignViewModel[];
    selectedCampaignId?: string | null;
    compact?: boolean;
    mobile?: boolean;
    hasNextPage?: boolean;
    loadingMore?: boolean;
    onSelect?: (campaignId: string) => void;
    onLoadMore?: (lastVisibleIndex: number) => void | Promise<void>;
  }

  let {
    campaigns,
    selectedCampaignId = null,
    compact = false,
    mobile = false,
    hasNextPage = false,
    loadingMore = false,
    onSelect,
    onLoadMore,
  }: Props = $props();

  let lastLoadTrigger = $state("");
  const virtualItems = $derived<(CampaignViewModel | null)[]>(hasNextPage ? [...campaigns, null] : campaigns);

  function handleVisibleRange(range: { end: number; start: number }): void {
    if (!hasNextPage || loadingMore || range.end < campaigns.length - 1) {
      return;
    }

    const nextTrigger = `${campaigns.length}:${range.end}`;
    if (nextTrigger === lastLoadTrigger) {
      return;
    }

    lastLoadTrigger = nextTrigger;
    void onLoadMore?.(range.end);
  }
</script>

{#if campaigns.length === 0}
  <div class="flex h-full min-h-50 items-center justify-center text-sm text-slate-500">No campaigns found</div>
{:else}
  <div class="min-h-0 grow overflow-y-auto">
    <VirtualList items={virtualItems} style="height:600px" onVisibleRangeUpdate={handleVisibleRange}>
      {#snippet vl_slot({ index, item })}
        <div class="px-2 pb-2" style={`min-height:${compact ? 108 : 128}px;`}>
          {#if item}
            <CampaignListItem campaign={item} {compact} {mobile} selected={item.id === selectedCampaignId} {onSelect} />
          {:else}
            <div
              class="flex h-full items-center justify-center rounded-xl border border-white/80 bg-white/75 text-sm
                text-slate-500 shadow-sm backdrop-blur-sm"
            >
              {#if loadingMore}
                Loading more campaigns...
              {:else}
                Scroll to load more
              {/if}
            </div>
          {/if}
        </div>
      {/snippet}
    </VirtualList>
  </div>
{/if}
