<script lang="ts">
  import { AccessGroup } from "$houdini/graphql/enums";
  import { Button, Input, LinkButton } from "$lib";
  import { PATH_CAMPAIGN_ADD } from "$lib/app/paths";
  import { sessionState } from "$lib/state/session.svelte";
  import Filter from "text-reach-frontend-library/icons/Filter.svelte";
  import Sort from "text-reach-frontend-library/icons/Sort.svelte";
  import CampaignVirtualList from "./CampaignVirtualList.svelte";
  import type { CampaignState } from "./campaign-state.svelte";

  interface Props {
    state: CampaignState;
  }

  let { state }: Props = $props();
</script>

<section class="flex h-full min-h-0 flex-col bg-gradient-to-br from-slate-100 via-slate-50 to-stone-100">
  <header class="sticky top-0 z-10 border-b border-white/80 bg-white/60 px-3 pt-3 pb-2 backdrop-blur-md">
    <div class="flex items-center gap-2">
      <h2 class="grow text-xl font-semibold text-slate-800">Campaigns</h2>
      {#if sessionState.hasAccess(AccessGroup.CAMPAIGN_WRITE)}
        <LinkButton id="campaign-add-mobile" class="h-8 px-2 text-sm" href={PATH_CAMPAIGN_ADD}>New</LinkButton>
      {/if}
    </div>

    <div class="mt-2 flex items-center gap-2">
      <Input
        id="campaign-search-mobile"
        class="grow"
        placeholder="Search campaigns"
        value={state.search}
        oninput={(event) => state.updateSearch(event.currentTarget.value)}
      />

      <Button variant="secondary" icon={Sort} class="size-9 p-0" aria-label="Sort campaigns" onclick={state.openSort} />

      <Button
        variant="secondary"
        icon={Filter}
        class="size-9 p-0"
        aria-label="Filter campaigns"
        onclick={state.openFilters}
      />
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
