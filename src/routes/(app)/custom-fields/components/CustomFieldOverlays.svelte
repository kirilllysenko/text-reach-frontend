<script lang="ts">
  import {
    FilterPanel,
    ResponsiveDialog,
    SortPanel,
    createFilterController,
    createSortController,
    type FilterPanelConfig,
  } from "$lib";
  import type { CustomFieldsState } from "$lib/features/custom-fields/custom-fields-state.svelte";
  import {
    customFieldSortFieldLabelMap,
    customFieldTypeLabelMap,
  } from "$lib/features/custom-fields/custom-fields-view-data";

  interface Props {
    filtering: ReturnType<typeof createFilterController>;
    sorting: ReturnType<typeof createSortController>;
    state: CustomFieldsState;
  }

  let { filtering: filterController, sorting, state }: Props = $props();

  const typeOptions = $derived(
    state.typeOptions.map((type) => ({
      value: type,
      label: customFieldTypeLabelMap[type],
    })),
  );

  const filtering = $derived.by<FilterPanelConfig>(() => ({
    title: "Active filters",
    description: "Refine the custom fields table",
    fields: [
      {
        kind: "checkbox-group",
        id: "types",
        label: "Types",
        filterId: "type",
        operator: "IN",
        options: typeOptions,
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
  <FilterPanel filtering={filterController} config={filtering} compact />

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
  <SortPanel {sorting} fieldOptions={sortFieldOptions} compact />

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
