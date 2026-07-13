<script lang="ts">
  import { Button, FilterPanel, ResponsiveDialog, type FilteringService, type FilterPanelConfig } from "$lib";
  import Filter from "$lib/icons/Filter.svelte";

  interface Props {
    filtering: FilteringService;
  }

  let { filtering }: Props = $props();
  let open = $state(false);

  const config: FilterPanelConfig = {
    title: "Active filters",
    description: "Refine the transactions table",
    fields: [
      {
        kind: "input-grid",
        id: "amounts",
        columns: 2,
        inputs: [
          {
            kind: "input",
            id: "minAmount",
            label: "Min amount",
            filterId: "minAmount",
            filterType: "comparison",
            operator: "GREATER_OR_EQUAL",
            inputType: "number",
            min: "0",
            placeholder: "0.00",
            valueKind: "number",
          },
          {
            kind: "input",
            id: "maxAmount",
            label: "Max amount",
            filterId: "maxAmount",
            filterType: "comparison",
            operator: "LESS_OR_EQUAL",
            inputType: "number",
            min: "0",
            placeholder: "100.00",
            valueKind: "number",
          },
        ],
      },
      {
        kind: "input-grid",
        id: "created-at",
        columns: 2,
        inputs: [
          {
            kind: "input",
            id: "createdFrom",
            label: "Created from",
            filterId: "createdFrom",
            filterType: "comparison",
            operator: "GREATER_OR_EQUAL",
            inputType: "date",
          },
          {
            kind: "input",
            id: "createdTo",
            label: "Created to",
            filterId: "createdTo",
            filterType: "comparison",
            operator: "LESS_OR_EQUAL",
            inputType: "date",
          },
        ],
      },
      {
        kind: "input-grid",
        id: "types",
        columns: 3,
        inputs: [
          {
            kind: "input",
            id: "currency",
            label: "Currency",
            filterId: "currency",
            filterType: "text",
            operator: "CONTAINS",
            inputType: "search",
            placeholder: "USD",
          },
          {
            kind: "input",
            id: "entryType",
            label: "Entry type",
            filterId: "entryType",
            filterType: "text",
            operator: "CONTAINS",
            inputType: "search",
            placeholder: "TOPUP",
          },
          {
            kind: "input",
            id: "sourceType",
            label: "Source type",
            filterId: "sourceType",
            filterType: "text",
            operator: "CONTAINS",
            inputType: "search",
            placeholder: "TOPUP",
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
  title="Filter transactions"
  description="Refine the transactions table without taking over the whole page."
  onClose={closeFilters}
>
  <FilterPanel {filtering} {config} compact />

  {#snippet mobileFooter()}
    <Button class="w-full" onclick={closeFilters}>Apply filters</Button>
  {/snippet}
</ResponsiveDialog>
