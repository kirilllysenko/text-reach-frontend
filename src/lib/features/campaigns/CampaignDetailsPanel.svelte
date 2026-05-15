<script lang="ts">
  import CampaignDetailsContent from "./CampaignDetailsContent.svelte";
  import type { CampaignsState } from "./campaigns-state.svelte";

  interface Props {
    state: CampaignsState;
  }

  let { state }: Props = $props();
</script>

<main class="min-w-0 grow overflow-y-auto bg-transparent p-4 sm:p-6">
  <CampaignDetailsContent campaign={state.selectedCampaign} groupNames={state.selectedCampaignGroupNames} />
</main>
