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
  import type { CampaignMessagesState } from "$lib/feature/message/message-state.svelte";
  import {
    messageSortFieldLabelMap,
    messageStatusLabelMap,
    messageStatusOptions,
  } from "$lib/feature/message/message-view-data";

  interface Props {
    filtering: FilteringService;
    sorting: SortPanelController;
    state: CampaignMessagesState;
  }

  let { filtering: filterController, sorting, state }: Props = $props();

  const filtering = $derived.by<FilterPanelConfig>(() => ({
    title: "Active filters",
    description: "Refine the messages table",
    fields: [
      {
        kind: "checkbox-group",
        id: "status",
        label: "Status",
        filterId: "status",
        operator: "IN",
        options: messageStatusOptions.map((status) => ({
          value: status,
          label: messageStatusLabelMap[status],
        })),
      },
      {
        kind: "input-grid",
        id: "message-fields",
        columns: 3,
        inputs: [
          {
            kind: "input",
            id: "sentFrom",
            label: "Sent from",
            filterId: "sentFrom",
            filterType: "comparison",
            operator: "GREATER_OR_EQUAL",
            inputType: "date",
          },
          {
            kind: "input",
            id: "sentTo",
            label: "Sent to",
            filterId: "sentTo",
            filterType: "comparison",
            operator: "LESS_OR_EQUAL",
            inputType: "date",
          },
          {
            kind: "input",
            id: "tenantPhoneNumber",
            label: "Tenant phone contains",
            filterId: "tenantPhoneNumber",
            filterType: "text",
            operator: "CONTAINS",
            inputType: "search",
            placeholder: "+15551234567",
          },
        ],
      },
    ],
  }));

  const sortFieldOptions = $derived(
    state.sortFieldOptions.map((field) => ({
      value: field,
      label: messageSortFieldLabelMap[field],
    })),
  );
</script>

<ResponsiveDialog
  open={state.filtersOpen}
  title="Filter messages"
  description="Refine the messages table without taking over the whole page."
  onClose={state.closeOverlays}
>
  <FilterPanel filtering={filterController} config={filtering} compact />

  {#snippet mobileFooter()}
    <Button class="w-full" onclick={state.closeOverlays}>Apply filters</Button>
  {/snippet}
</ResponsiveDialog>

<ResponsiveDialog
  open={state.sortOpen}
  title="Sort messages"
  description="Adjust the priority stack for the messages table."
  onClose={state.closeOverlays}
>
  <SortPanel {sorting} fieldOptions={sortFieldOptions} compact />

  {#snippet mobileFooter()}
    <Button class="w-full" onclick={state.closeOverlays}>Apply sorting</Button>
  {/snippet}
</ResponsiveDialog>
