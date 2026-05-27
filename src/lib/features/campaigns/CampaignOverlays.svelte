<script lang="ts">
  import { ResponsiveDialog } from "$lib";
  import CampaignFilterPanel from "./CampaignFilterPanel.svelte";
  import CampaignSortPanel from "./CampaignSortPanel.svelte";
  import type { CampaignsState } from "./campaigns-state.svelte";

  interface Props {
    state: CampaignsState;
  }

  let { state }: Props = $props();
</script>

<ResponsiveDialog
  open={state.filtersOpen}
  title="Filter campaigns"
  description="Refine the campaign feed without taking over the whole page."
  onClose={state.closeOverlays}
>
  <CampaignFilterPanel
    activeFilterChips={state.activeFilterChips}
    statusOptions={state.statusOptions}
    selectedStatuses={state.statusFilters}
    createdAfter={state.createdAfter}
    minSentMessageCount={state.minSentMessageCount}
    minMessageCount={state.minMessageCount}
    compact
    statusLabel={state.statusLabel}
    onToggleStatus={state.toggleStatusFilter}
    onCreatedAfterInput={state.updateCreatedAfter}
    onMinSentInput={state.updateMinSentMessageCount}
    onMinMessageInput={state.updateMinMessageCount}
    onClear={state.clearFilters}
  />

  {#snippet mobileFooter()}
    <button
      class="h-10 w-full rounded-xl bg-slate-700 text-sm font-medium text-white shadow-sm
        hover:cursor-pointer hover:bg-slate-800"
      type="button"
      onclick={state.closeOverlays}
    >
      Apply filters
    </button>
  {/snippet}
</ResponsiveDialog>

<ResponsiveDialog
  open={state.sortOpen}
  title="Sort campaigns"
  description="Adjust the priority stack for the campaign list."
  onClose={state.closeOverlays}
>
  <CampaignSortPanel
    sortRules={state.sortRules}
    sortFieldOptions={state.sortFieldOptions}
    sortChips={state.sortChips}
    compact
    onAddRule={state.addSortRule}
    onRemoveRule={state.removeSortRule}
    onFieldChange={state.updateSortRuleField}
    onDirectionChange={state.updateSortRuleDirection}
    onReset={state.clearSortRules}
  />

  {#snippet mobileFooter()}
    <button
      class="h-10 w-full rounded-xl bg-slate-700 text-sm font-medium text-white shadow-sm
        hover:cursor-pointer hover:bg-slate-800"
      type="button"
      onclick={state.closeOverlays}
    >
      Apply sorting
    </button>
  {/snippet}
</ResponsiveDialog>
