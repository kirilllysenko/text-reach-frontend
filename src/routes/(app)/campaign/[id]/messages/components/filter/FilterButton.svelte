<script lang="ts">
  import { Button, FilterPanel, ResponsiveDialog, type FilteringService, type FilterPanelConfig } from "$lib";
  import { messageStatusLabelMap, messageStatusOptions } from "$lib/feature/message/message-view-data";
  import Filter from "$lib/icons/Filter.svelte";

  interface Props {
    filtering: FilteringService;
  }

  let { filtering }: Props = $props();
  let open = $state(false);

  const config: FilterPanelConfig = {
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
  };

  function openFilters(): void {
    open = true;
  }

  function closeFilters(): void {
    open = false;
  }
</script>

<Button variant="secondary" active={open} icon={Filter} class="relative gap-2 text-sm" onclick={openFilters}>
  <span class="flex items-center gap-2">
    Filters
    <span
      class="flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-700 px-1 text-[10px]
        leading-4 text-white"
    >
      {filtering.getVisibleActiveFilterCount()}
    </span>
  </span>
</Button>

<ResponsiveDialog
  {open}
  title="Filter messages"
  description="Refine the messages table without taking over the whole page."
  onClose={closeFilters}
>
  <FilterPanel {filtering} {config} compact />

  {#snippet mobileFooter()}
    <Button class="w-full" onclick={closeFilters}>Apply filters</Button>
  {/snippet}
</ResponsiveDialog>
