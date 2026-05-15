<script lang="ts">
  import CampaignDesktopDialog from "./CampaignDesktopDialog.svelte";
  import CampaignFilterPanel from "./CampaignFilterPanel.svelte";
  import CampaignSortPanel from "./CampaignSortPanel.svelte";
  import type { CampaignsState } from "./campaigns-state.svelte";

  interface Props {
    state: CampaignsState;
  }

  let { state }: Props = $props();
</script>

<CampaignDesktopDialog
  open={state.desktopFiltersOpen}
  title="Filter campaigns"
  description="Refine the campaign feed without taking over the whole page."
  onClose={state.closeDesktopPanels}
>
  <CampaignFilterPanel
    activeFilterChips={state.activeFilterChips}
    statusOptions={state.statusOptions}
    selectedStatuses={state.statusFilters}
    createdAfter={state.createdAfter}
    minSentMessageCount={state.minSentMessageCount}
    minMessageCount={state.minMessageCount}
    statusLabel={state.statusLabel}
    onToggleStatus={state.toggleStatusFilter}
    onCreatedAfterInput={state.updateCreatedAfter}
    onMinSentInput={state.updateMinSentMessageCount}
    onMinMessageInput={state.updateMinMessageCount}
    onClear={state.clearFilters}
  />
</CampaignDesktopDialog>

<CampaignDesktopDialog
  open={state.desktopSortOpen}
  title="Sort campaigns"
  description="Adjust the priority stack for the campaign list."
  onClose={state.closeDesktopPanels}
>
  <CampaignSortPanel
    sortRules={state.sortRules}
    sortFieldOptions={state.sortFieldOptions}
    sortChips={state.sortChips}
    onAddRule={state.addSortRule}
    onRemoveRule={state.removeSortRule}
    onFieldChange={state.updateSortRuleField}
    onDirectionChange={state.updateSortRuleDirection}
    onReset={state.clearSortRules}
  />
</CampaignDesktopDialog>
