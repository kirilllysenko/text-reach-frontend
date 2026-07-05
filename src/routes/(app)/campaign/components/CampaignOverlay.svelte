<script lang="ts">
  import { Button, FilterPanel, ResponsiveDialog, SortPanel, type FilterPanelConfig } from "$lib";
  import type { CampaignState } from "$lib/feature/campaign/campaign-state.svelte";
  import { sortFieldLabelMap } from "$lib/feature/campaign/campaign-view-data";

  interface Props {
    state: CampaignState;
  }

  let { state }: Props = $props();

  const filtering = $derived.by<FilterPanelConfig>(() => ({
    title: "Active filters",
    description: "Refine the campaign feed",
    fields: [
      {
        kind: "checkbox-group",
        id: "status",
        label: "Status",
        filterId: "status",
        operator: "IN",
        options: state.statusOptions.map((status) => ({
          value: status,
          label: state.statusLabel(status),
        })),
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
            filterId: "createdAfter",
            filterType: "comparison",
            operator: "GREATER_OR_EQUAL",
            inputType: "date",
          },
          {
            kind: "input",
            id: "minSentMessageCount",
            label: "Min sent messages",
            filterId: "minSentMessageCount",
            filterType: "comparison",
            operator: "GREATER_OR_EQUAL",
            inputType: "number",
            min: "0",
            valueKind: "number",
          },
          {
            kind: "input",
            id: "minMessageCount",
            label: "Min all messages",
            filterId: "minMessageCount",
            filterType: "comparison",
            operator: "GREATER_OR_EQUAL",
            inputType: "number",
            min: "0",
            valueKind: "number",
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
  <FilterPanel filtering={state.filters} config={filtering} compact />

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
  <SortPanel
    sorting={state.sorting}
    fieldOptions={sortFieldOptions}
    compact
    directionOptions={["descending", "ascending"]}
  />

  {#snippet mobileFooter()}
    <Button class="w-full" onclick={state.closeOverlays}>Apply sorting</Button>
  {/snippet}
</ResponsiveDialog>
