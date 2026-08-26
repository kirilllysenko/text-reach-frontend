<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { page } from "$app/state";
  import { AccessGroup } from "$houdini/graphql/enums";
  import { LinkButton, PageTitle } from "$lib";
  import { PATH_CAMPAIGN_ADD } from "$lib/app/paths";
  import { phoneFilterState } from "$lib/state/phone-filter.svelte";
  import { sessionState } from "$lib/state/session.svelte";
  import { CampaignState, type CampaignListMode } from "./components/campaign-state.svelte";
  import CampaignDesktopSidebar from "./components/CampaignDesktopSidebar.svelte";
  import CampaignDetailsPanel from "./components/CampaignDetailsPanel.svelte";
  import CampaignMobileDetails from "./components/CampaignMobileDetails.svelte";
  import CampaignMobileList from "./components/CampaignMobileList.svelte";
  import CampaignOverlay from "./components/CampaignOverlay.svelte";

  const navigationListMode = (page.state as { campaignListMode?: CampaignListMode }).campaignListMode;
  const initialListMode =
    navigationListMode ?? (page.url.searchParams.get("view") === "schedule" ? "schedule" : "history");
  const state = new CampaignState(phoneFilterState.selectedPhoneId, initialListMode);
  const canWriteCampaigns = $derived(sessionState.hasAccess(AccessGroup.CAMPAIGN_WRITE));

  onMount(() => phoneFilterState.subscribe(state.setPhoneFilter));

  onDestroy(() => state.dispose());
</script>

<div
  class="relative flex h-full min-h-0 flex-col rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:p-3"
>
  <div class="hidden sm:block">
    <PageTitle title="Campaigns">
      {#if canWriteCampaigns}
        <LinkButton id="campaign-add" href={PATH_CAMPAIGN_ADD}>Create campaign</LinkButton>
      {/if}
    </PageTitle>
  </div>

  {#if state.loadingError}
    <div
      class="text-amber-900 mx-3 mb-3 rounded-xl border border-amber-200/80 bg-amber-100/90 px-3 py-2 text-sm
        shadow-sm sm:mx-0"
    >
      {state.loadingError}
    </div>
  {/if}

  <div class="relative min-h-0 grow">
    {#if state.loading}
      <div
        class="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-white/70 text-sm text-slate-600
          backdrop-blur-sm"
      >
        Loading campaigns...
      </div>
    {/if}

    <div class="h-full sm:hidden">
      {#if state.mobileView === "list"}
        <CampaignMobileList {state} />
      {:else}
        <CampaignMobileDetails {state} />
      {/if}
    </div>

    <div
      class="hidden h-full overflow-hidden rounded-2xl border border-white/70 bg-white/70 shadow-[0_20px_45px_-25px_rgba(30,41,59,0.45)]
        backdrop-blur-md sm:flex"
    >
      <CampaignDesktopSidebar {state} />

      <div
        class={[
          `min-w-0 overflow-hidden transition-[width,opacity] duration-300 ease-in-out`,
          state.desktopExpanded ? "pointer-events-none opacity-0" : "opacity-100",
        ]}
        style={state.desktopExpanded ? "width:0px;" : "width:calc(100% - 18rem);"}
      >
        <CampaignDetailsPanel {state} />
      </div>
    </div>
  </div>
</div>

<CampaignOverlay {state} />
