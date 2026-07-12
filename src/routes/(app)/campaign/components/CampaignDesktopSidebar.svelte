<script lang="ts">
  import { Button, Input } from "$lib";
  import Filter from "$lib/icons/Filter.svelte";
  import Sort from "$lib/icons/Sort.svelte";
  import CampaignVirtualList from "./CampaignVirtualList.svelte";
  import type { CampaignState } from "$lib/feature/campaign/campaign-state.svelte";

  interface Props {
    state: CampaignState;
  }

  let { state }: Props = $props();
</script>

<aside
  class={[
    `relative flex h-full min-h-0 shrink-0 flex-col transition-[width] duration-300 ease-in-out`,
    state.desktopExpanded ? "w-full" : "w-72 min-w-72 border-r border-white/70",
  ]}
>
  <div class="shrink-0 space-y-3 border-b border-white/70 bg-white/55 p-3 backdrop-blur-sm">
    <div class="flex items-center gap-2">
      <Input
        class="min-w-0 grow"
        placeholder="Search campaigns"
        value={state.search}
        oninput={(event) => state.updateSearch(event.currentTarget.value)}
      />

      <Button
        variant="secondary"
        active={state.filtersOpen}
        icon={Filter}
        class="relative size-9 p-0"
        aria-label="Toggle filters"
        onclick={state.openFilters}
      >
        <span
          class="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-700
            px-1 text-[10px] leading-4 text-white"
        >
          {state.activeFilterCount}
        </span>
      </Button>

      <Button
        variant="secondary"
        active={state.sortOpen}
        icon={Sort}
        class="relative size-9 p-0"
        aria-label="Toggle sorting"
        onclick={state.openSort}
      >
        <span
          class="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-700
            px-1 text-[10px] leading-4 text-white"
        >
          {state.activeSortCount}
        </span>
      </Button>
    </div>
  </div>

  <div class="min-h-0 grow p-2">
    <CampaignVirtualList
      campaigns={state.campaigns}
      selectedCampaignId={state.selectedCampaignId}
      compact={!state.desktopExpanded}
      hasNextPage={state.hasNextPage}
      loadingMore={state.loadingMore}
      onSelect={state.selectCampaign}
      onLoadMore={state.loadMoreIfNeeded}
    />
  </div>

  <Button
    variant="secondary"
    class="absolute top-1/2 right-0 z-10 size-8 translate-x-1/2 -translate-y-1/2 rounded-full
      p-0 shadow-md backdrop-blur-sm"
    aria-label={state.desktopExpanded ? "Collapse campaign list" : "Expand campaign list"}
    onclick={state.toggleDesktopExpanded}
  >
    {state.desktopExpanded ? "→" : "←"}
  </Button>
</aside>
