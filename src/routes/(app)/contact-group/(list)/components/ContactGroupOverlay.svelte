<script lang="ts">
  import {
    Button,
    FilterPanel,
    ResponsiveDialog,
    SortPanel,
    type FilteringService,
    type FilterPanelConfig,
    type SortPanelController,
  } from "$lib";
  import type { ContactGroupState } from "$lib/feature/contact-group/contact-group-state.svelte";
  import { contactGroupSortFieldLabelMap } from "$lib/feature/contact-group/contact-group-view-data";

  interface Props {
    filtering: FilteringService;
    sorting: SortPanelController;
    state: ContactGroupState;
  }

  let { filtering: filterController, sorting, state }: Props = $props();

  const filtering = $derived.by<FilterPanelConfig>(() => ({
    title: "Active filters",
    description: "Refine the contact groups table",
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
  title="Filter contact groups"
  description="Refine the contact groups table without taking over the whole page."
  onClose={state.closeOverlays}
>
  <FilterPanel filtering={filterController} config={filtering} compact />

  {#snippet mobileFooter()}
    <Button class="w-full" onclick={state.closeOverlays}>Apply filters</Button>
  {/snippet}
</ResponsiveDialog>

<ResponsiveDialog
  open={state.sortOpen}
  title="Sort contact groups"
  description="Adjust the priority stack for the contact groups table."
  onClose={state.closeOverlays}
>
  <SortPanel {sorting} fieldOptions={sortFieldOptions} compact />

  {#snippet mobileFooter()}
    <Button class="w-full" onclick={state.closeOverlays}>Apply sorting</Button>
  {/snippet}
</ResponsiveDialog>
