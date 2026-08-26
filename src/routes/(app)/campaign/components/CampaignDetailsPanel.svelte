<script lang="ts">
  import CampaignDetailsContent from "./CampaignDetailsContent.svelte";
  import type { CampaignState } from "./campaign-state.svelte";

  interface Props {
    state: CampaignState;
  }

  let { state }: Props = $props();
</script>

<main class="min-w-0 grow overflow-y-auto bg-transparent p-4 sm:p-6">
  <CampaignDetailsContent
    campaign={state.selectedCampaign}
    groupNames={state.selectedCampaignGroupNames}
    onStatusChanged={state.updateCampaignStatus}
  />
</main>
