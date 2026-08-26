<script lang="ts">
  import CampaignDetailsContent from "./CampaignDetailsContent.svelte";
  import CampaignStatusBadge from "./CampaignStatusBadge.svelte";
  import { Button } from "$lib";
  import type { CampaignState } from "./campaign-state.svelte";

  interface Props {
    state: CampaignState;
  }

  let { state }: Props = $props();
</script>

<section class="flex h-full min-h-0 flex-col bg-gradient-to-br from-slate-100 via-slate-50 to-stone-100">
  {#if state.selectedCampaign}
    <header class="sticky top-0 z-10 border-b border-white/80 bg-white/60 px-3 pt-3 pb-2 backdrop-blur-md">
      <div class="flex items-center gap-2">
        <Button variant="secondary" onclick={state.backToMobileList}>← Back</Button>
        <div class="min-w-0 grow">
          <h2 class="truncate text-base font-semibold text-slate-800">{state.selectedCampaign.name}</h2>
        </div>
        <CampaignStatusBadge status={state.selectedCampaign.status} />
      </div>
    </header>

    <main class="min-h-0 grow overflow-y-auto p-3">
      <CampaignDetailsContent
        campaign={state.selectedCampaign}
        groupNames={state.selectedCampaignGroupNames}
        onStatusChanged={state.updateCampaignStatus}
        mobile
      />
    </main>
  {:else}
    <div class="flex h-full min-h-60 items-center justify-center text-sm text-slate-500">No campaign selected</div>
  {/if}
</section>
