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
  title="Filter contact groups"
  description="Refine the contact groups table without taking over the whole page."
  onClose={closeFilters}
>
  <FilterPanel {filtering} {config} compact />

  {#snippet mobileFooter()}
    <Button class="w-full" onclick={closeFilters}>Apply filters</Button>
  {/snippet}
</ResponsiveDialog>
