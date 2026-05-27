<script lang="ts">
  import { Button, Input } from "$lib";
  import CampaignVirtualList from "./CampaignVirtualList.svelte";
  import type { CampaignsState } from "./campaigns-state.svelte";

  interface Props {
    state: CampaignsState;
  }

  let { state }: Props = $props();
</script>

<section class="flex h-full min-h-0 flex-col bg-gradient-to-br from-slate-100 via-slate-50 to-stone-100">
  <header class="sticky top-0 z-10 border-b border-white/80 bg-white/60 px-3 pt-3 pb-2 backdrop-blur-md">
    <div class="flex items-center gap-2">
      <h2 class="grow text-xl font-semibold text-slate-800">Campaigns</h2>
      <Button small>New</Button>
    </div>

    <div class="mt-2 flex items-center gap-2">
      <Input
        class="grow"
        placeholder="Search campaigns"
        value={state.search}
        oninput={(event) => state.updateSearch(event.currentTarget.value)}
      />

      <button
        class="flex size-9 items-center justify-center rounded-xl border border-white/80 bg-white/90 shadow-sm
          hover:cursor-pointer hover:bg-white"
        type="button"
        aria-label="Sort campaigns"
        onclick={state.openSort}
      >
        <svg viewBox="0 0 24 24" class="size-5 fill-slate-700" aria-hidden="true">
          <path d="M7 4h10v2H7V4zm-2 7h14v2H5v-2zm3 7h8v2H8v-2z" />
        </svg>
      </button>

      <button
        class="flex size-9 items-center justify-center rounded-xl border border-white/80 bg-white/90 shadow-sm
          hover:cursor-pointer hover:bg-white"
        type="button"
        aria-label="Filter campaigns"
        onclick={state.openFilters}
      >
        <svg viewBox="0 0 24 24" class="size-5 fill-slate-700" aria-hidden="true">
          <path d="M3 5h18l-7 8v5l-4 2v-7L3 5z" />
        </svg>
      </button>
    </div>
  </header>

  <div class="min-h-0 grow p-3">
    <CampaignVirtualList
      campaigns={state.campaigns}
      selectedCampaignId={state.selectedCampaignId}
      compact
      mobile
      hasNextPage={state.hasNextPage}
      loadingMore={state.loadingMore}
      onSelect={state.openCampaignDetailsOnMobile}
      onLoadMore={state.loadMoreIfNeeded}
    />
  </div>
</section>
