<script lang="ts">
  import { Button, ResponsiveDialog, SortPanel } from "$lib";
  import type { CampaignState } from "$lib/feature/campaign/campaign-state.svelte";
  import { sortFieldLabelMap } from "$lib/feature/campaign/campaign-view-data";
  import CampaignFilterPanel from "./CampaignFilterPanel.svelte";

  interface Props {
    state: CampaignState;
  }

  let { state }: Props = $props();

  const sortFieldOptions = $derived(
    state.sortFieldOptions.map((field) => ({
      value: field,
      label: sortFieldLabelMap[field],
    })),
  );
</script>

<ResponsiveDialog
  open={state.filtersOpen}
  title="Filter campaigns"
  description="Refine the campaign feed without taking over the whole page."
  onClose={state.closeOverlays}
>
  <CampaignFilterPanel {state} />

  {#snippet mobileFooter()}
    <Button class="w-full" onclick={state.closeOverlays}>Apply filters</Button>
  {/snippet}
</ResponsiveDialog>

<ResponsiveDialog
  open={state.sortOpen}
  title="Sort campaigns"
  description="Adjust the priority stack for the campaign list."
  onClose={state.closeOverlays}
>
  <SortPanel sorting={state} fieldOptions={sortFieldOptions} compact directionOptions={["descending", "ascending"]} />

  {#snippet mobileFooter()}
    <Button class="w-full" onclick={state.closeOverlays}>Apply sorting</Button>
  {/snippet}
</ResponsiveDialog>
