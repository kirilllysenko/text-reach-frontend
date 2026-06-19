<script lang="ts">
  import { FilterPanel, ResponsiveDialog, SortPanel, type FilterPanelConfig } from "$lib";
  import type { ContactGroupsState } from "$lib/features/contact-groups/contact-groups-state.svelte";
  import { contactGroupSortFieldLabelMap } from "$lib/features/contact-groups/contact-groups-view-data";

  interface Props {
    state: ContactGroupsState;
  }

  let { state }: Props = $props();

  const filtering = $derived.by<FilterPanelConfig>(() => ({
    activeFilterChips: state.activeFilterChips,
    title: "Active filters",
    description: "Refine the groups table",
    onClear: state.clearFilters,
    fields: [
      {
        kind: "input-grid",
        id: "contact-counts",
        columns: 2,
        inputs: [
          {
            kind: "input",
            id: "minContactCount",
            label: "Min contacts",
            inputType: "number",
            min: "0",
            value: state.minContactCount,
            placeholder: "0",
            onInput: state.updateMinContactCount,
          },
          {
            kind: "input",
            id: "maxContactCount",
            label: "Max contacts",
            inputType: "number",
            min: "0",
            value: state.maxContactCount,
            placeholder: "1000",
            onInput: state.updateMaxContactCount,
          },
        ],
      },
    ],
  }));

  const sortFieldOptions = $derived(
    state.sortFieldOptions.map((field) => ({
      value: field,
      label: contactGroupSortFieldLabelMap[field],
    })),
  );
</script>

<ResponsiveDialog
  open={state.filtersOpen}
  title="Filter groups"
  description="Refine the groups table without taking over the whole page."
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
  title="Sort groups"
  description="Adjust the priority stack for the groups table."
  onClose={state.closeOverlays}
>
  <SortPanel
    rules={state.sortRules}
    fieldOptions={sortFieldOptions}
    chips={state.sortChips}
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
