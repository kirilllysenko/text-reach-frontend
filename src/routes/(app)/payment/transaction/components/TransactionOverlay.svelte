<script lang="ts">
  import {
    Button,
    FilterPanel,
    ResponsiveDialog,
    SortPanel,
    createFilterController,
    createSortController,
    type FilterPanelConfig,
  } from "$lib";
  import type { WalletTransactionState } from "$lib/feature/payment/payment-state.svelte";
  import { walletTransactionSortFieldLabelMap } from "$lib/feature/payment/payment-view-data";

  interface Props {
    filtering: ReturnType<typeof createFilterController>;
    sorting: ReturnType<typeof createSortController>;
    state: WalletTransactionState;
  }

  let { filtering: filterController, sorting, state }: Props = $props();

  const filtering = $derived.by<FilterPanelConfig>(() => ({
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
  }));

  const sortFieldOptions = $derived(
    state.sortFieldOptions.map((field) => ({
      value: field,
      label: walletTransactionSortFieldLabelMap[field],
    })),
  );
</script>

<ResponsiveDialog
  open={state.filtersOpen}
  title="Filter transactions"
  description="Refine the transactions table without taking over the whole page."
  onClose={state.closeOverlays}
>
  <FilterPanel filtering={filterController} config={filtering} compact />

  {#snippet mobileFooter()}
    <Button class="w-full" onclick={state.closeOverlays}>Apply filters</Button>
  {/snippet}
</ResponsiveDialog>

<ResponsiveDialog
  open={state.sortOpen}
  title="Sort transactions"
  description="Adjust the priority stack for the transactions table."
  onClose={state.closeOverlays}
>
  <SortPanel {sorting} fieldOptions={sortFieldOptions} compact />

  {#snippet mobileFooter()}
    <Button class="w-full" onclick={state.closeOverlays}>Apply sorting</Button>
  {/snippet}
</ResponsiveDialog>
