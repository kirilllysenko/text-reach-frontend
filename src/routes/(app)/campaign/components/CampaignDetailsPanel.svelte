<script lang="ts">
  import CampaignDetailsContent from "./CampaignDetailsContent.svelte";
  import { getCampaignState } from "./campaign-state.svelte";

  const state = getCampaignState();
</script>

<main class="min-w-0 grow overflow-y-auto bg-transparent p-4 sm:p-6">
  <CampaignDetailsContent
    campaign={state.selectedCampaign}
    groupNames={state.selectedCampaignGroupNames}
    onStatusChanged={state.updateCampaignStatus}
  />
</main>
