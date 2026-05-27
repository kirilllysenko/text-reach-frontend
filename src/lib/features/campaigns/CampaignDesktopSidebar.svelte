<script lang="ts">
  import { Input } from "$lib";
  import CampaignVirtualList from "./CampaignVirtualList.svelte";
  import type { CampaignsState } from "./campaigns-state.svelte";

  interface Props {
    state: CampaignsState;
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

      <button
        class={[
          `relative flex size-9 items-center justify-center rounded-xl border bg-white/90 shadow-sm
            hover:cursor-pointer hover:bg-white`,
          state.filtersOpen ? "border-sky-300 bg-sky-50/90" : "border-white/80",
        ]}
        type="button"
        aria-label="Toggle filters"
        onclick={state.openFilters}
      >
        <svg
          viewBox="0 0 24 24"
          class={["size-5", state.filtersOpen ? "fill-sky-700" : "fill-slate-700"]}
          aria-hidden="true"
        >
          <path d="M3 5h18l-7 8v5l-4 2v-7L3 5z" />
        </svg>
        <span
          class="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-700
            px-1 text-[10px] leading-4 text-white"
        >
          {state.activeFilterCount}
        </span>
      </button>

      <button
        class={[
          `relative flex size-9 items-center justify-center rounded-xl border bg-white/90 shadow-sm
            hover:cursor-pointer hover:bg-white`,
          state.sortOpen ? "border-sky-300 bg-sky-50/90" : "border-white/80",
        ]}
        type="button"
        aria-label="Toggle sorting"
        onclick={state.openSort}
      >
        <svg
          viewBox="0 0 24 24"
          class={["size-5", state.sortOpen ? "fill-sky-700" : "fill-slate-700"]}
          aria-hidden="true"
        >
          <path d="M7 4h10v2H7V4zm-2 7h14v2H5v-2zm3 7h8v2H8v-2z" />
        </svg>
        <span
          class="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-700
            px-1 text-[10px] leading-4 text-white"
        >
          {state.activeSortCount}
        </span>
      </button>
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

  <button
    class="absolute top-1/2 right-0 z-10 size-8 translate-x-1/2 -translate-y-1/2 rounded-full border
      border-white/80 bg-white/90 text-slate-600 shadow-md backdrop-blur-sm hover:cursor-pointer hover:bg-white"
    type="button"
    aria-label={state.desktopExpanded ? "Collapse campaign list" : "Expand campaign list"}
    onclick={state.toggleDesktopExpanded}
  >
    {state.desktopExpanded ? "→" : "←"}
  </button>
</aside>
