<script lang="ts">
  import { FilterPanel, ResponsiveDialog, SortPanel, type FilterPanelConfig } from "$lib";
  import type { CampaignsState } from "$lib/features/campaigns/campaigns-state.svelte";
  import { sortFieldLabelMap, type CampaignStatus } from "$lib/features/campaigns/campaigns-view-data";

  interface Props {
    state: CampaignsState;
  }

  let { state }: Props = $props();

  const filtering = $derived.by<FilterPanelConfig>(() => ({
    activeFilterChips: state.activeFilterChips,
    title: "Active filters",
    description: "Refine the campaign feed",
    onClear: state.clearFilters,
    fields: [
      {
        kind: "checkbox-group",
        id: "status",
        label: "Status",
        options: state.statusOptions.map((status) => ({
          value: status,
          label: state.statusLabel(status),
          checked: state.statusFilters.includes(status),
        })),
        onToggle: (status) => state.toggleStatusFilter(status as NonNullable<CampaignStatus>),
      },
      {
        kind: "input-grid",
        id: "campaign-fields",
        columns: 3,
        inputs: [
          {
            kind: "input",
            id: "createdAfter",
            label: "Created after",
            inputType: "date",
            value: state.createdAfter,
            onInput: state.updateCreatedAfter,
          },
          {
            kind: "input",
            id: "minSentMessageCount",
            label: "Min sent messages",
            inputType: "number",
            min: "0",
            value: state.minSentMessageCount,
            onInput: state.updateMinSentMessageCount,
          },
          {
            kind: "input",
            id: "minMessageCount",
            label: "Min all messages",
            inputType: "number",
            min: "0",
            value: state.minMessageCount,
            onInput: state.updateMinMessageCount,
          },
        ],
      },
    ],
  }));

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
  <FilterPanel {filtering} compact />

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
  <SortPanel
    rules={state.sortRules}
    fieldOptions={sortFieldOptions}
    chips={state.sortChips}
    compact
    directionOptions={["DESC", "ASC"]}
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
