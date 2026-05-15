<script lang="ts">
  import { createVirtualizer } from "@tanstack/svelte-virtual";
  import { get } from "svelte/store";
  import CampaignListItem from "./CampaignListItem.svelte";
  import type { CampaignViewModel } from "./campaigns-models";

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

  let scrollElement = $state<HTMLDivElement | null>(null);
  let lastLoadTrigger = $state("");

  const virtualizer = createVirtualizer<HTMLDivElement, HTMLDivElement>({
    count: 0,
    getScrollElement: () => scrollElement,
    estimateSize: () => (compact ? 108 : 128),
    overscan: 8,
  });

  $effect(() => {
    get(virtualizer).setOptions({
      count: campaigns.length + (hasNextPage ? 1 : 0),
      getScrollElement: () => scrollElement,
      estimateSize: () => (compact ? 108 : 128),
      overscan: 8,
    });
  });

  $effect(() => {
    const lastVisibleItem = $virtualizer.getVirtualItems().at(-1);
    if (!lastVisibleItem || !hasNextPage || loadingMore) {
      return;
    }

    if (lastVisibleItem.index < campaigns.length - 1) {
      return;
    }

    const nextTrigger = `${campaigns.length}:${lastVisibleItem.index}`;
    if (nextTrigger === lastLoadTrigger) {
      return;
    }

    lastLoadTrigger = nextTrigger;
    void onLoadMore?.(lastVisibleItem.index);
  });
</script>

{#if campaigns.length === 0}
  <div class="flex h-full min-h-50 items-center justify-center text-sm text-slate-500">No campaigns found</div>
{:else}
  <div bind:this={scrollElement} class="min-h-0 grow overflow-y-auto">
    <div class="relative w-full" style={`height:${$virtualizer.getTotalSize()}px;`}>
      {#each $virtualizer.getVirtualItems() as item (item.key)}
        <div
          class="absolute top-0 left-0 w-full px-2 pb-2"
          style={`height:${item.size}px;transform:translateY(${item.start}px);`}
        >
          {#if item.index < campaigns.length}
            <CampaignListItem
              campaign={campaigns[item.index]!}
              {compact}
              {mobile}
              selected={campaigns[item.index]?.id === selectedCampaignId}
              {onSelect}
            />
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
      {/each}
    </div>
  </div>
{/if}
