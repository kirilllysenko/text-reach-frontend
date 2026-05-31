<script lang="ts">
  import { onDestroy } from "svelte";
  import PageTitle from "$lib/components/page-title/PageTitle.svelte";
  import { CampaignsState } from "$lib/features/campaigns/campaigns-state.svelte";
  import CampaignDesktopSidebar from "./components/CampaignDesktopSidebar.svelte";
  import CampaignDetailsPanel from "./components/CampaignDetailsPanel.svelte";
  import CampaignMobileDetails from "./components/CampaignMobileDetails.svelte";
  import CampaignMobileList from "./components/CampaignMobileList.svelte";
  import CampaignOverlays from "./components/CampaignOverlays.svelte";

  const state = new CampaignsState();

  onDestroy(() => state.dispose());
</script>

<div
  class="relative flex h-full min-h-0 flex-col rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:p-3"
>
  <div class="hidden sm:block">
    <PageTitle title="Campaigns" />
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

<CampaignOverlays {state} />
