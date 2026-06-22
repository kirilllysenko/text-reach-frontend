<script lang="ts">
  import { FilterPanel, ResponsiveDialog, SortPanel, type DataTable, type FilterPanelConfig } from "$lib";
  import type { ContactGroupsState } from "$lib/features/contact-groups/contact-groups-state.svelte";
  import {
    contactGroupSortFieldLabelMap,
    type ContactGroupViewModel,
  } from "$lib/features/contact-groups/contact-groups-view-data";

  interface Props {
    state: ContactGroupsState;
    table: DataTable<ContactGroupViewModel>;
  }

  let { state, table }: Props = $props();

  const filtering = $derived.by<FilterPanelConfig>(() => ({
    title: "Active filters",
    description: "Refine the groups table",
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
            filterId: "minContactCount",
            filterType: "comparison",
            operator: "GREATER_OR_EQUAL",
            inputType: "number",
            min: "0",
            placeholder: "0",
            valueKind: "number",
          },
          {
            kind: "input",
            id: "maxContactCount",
            label: "Max contacts",
            filterId: "maxContactCount",
            filterType: "comparison",
            operator: "LESS_OR_EQUAL",
            inputType: "number",
            min: "0",
            placeholder: "1000",
            valueKind: "number",
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
  <FilterPanel filtering={table.filters} config={filtering} compact />

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
  <SortPanel sorting={table.sorting} fieldOptions={sortFieldOptions} compact />

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
