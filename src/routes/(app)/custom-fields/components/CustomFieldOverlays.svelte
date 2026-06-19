<script lang="ts">
  import { FilterPanel, ResponsiveDialog, SortPanel, type FilterPanelConfig } from "$lib";
  import type { CustomFieldsState } from "$lib/features/custom-fields/custom-fields-state.svelte";
  import {
    customFieldSortFieldLabelMap,
    customFieldTypeLabelMap,
  } from "$lib/features/custom-fields/custom-fields-view-data";

  interface Props {
    state: CustomFieldsState;
  }

  let { state }: Props = $props();

  const typeOptions = $derived(
    state.typeOptions.map((type) => ({
      value: type,
      label: customFieldTypeLabelMap[type],
      checked: state.typeFilters.includes(type),
    })),
  );

  const filtering = $derived.by<FilterPanelConfig>(() => ({
    activeFilterChips: state.activeFilterChips,
    title: "Active filters",
    description: "Refine the custom fields table",
    onClear: state.clearFilters,
    fields: [
      {
        kind: "checkbox-group",
        id: "types",
        label: "Types",
        options: typeOptions,
        onToggle: (value) => state.toggleTypeFilter(value as (typeof state.typeOptions)[number]),
      },
    ],
  }));

  const sortFieldOptions = $derived(
    state.sortFieldOptions.map((field) => ({
      value: field,
      label: customFieldSortFieldLabelMap[field],
    })),
  );
</script>

<ResponsiveDialog
  open={state.filtersOpen}
  title="Filter custom fields"
  description="Refine the custom fields table without taking over the whole page."
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
  title="Sort custom fields"
  description="Adjust the priority stack for the custom fields table."
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
