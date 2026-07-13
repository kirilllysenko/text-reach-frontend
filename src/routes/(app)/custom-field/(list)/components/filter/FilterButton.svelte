<script lang="ts">
  import { Button, FilterPanel, ResponsiveDialog, type FilteringService, type FilterPanelConfig } from "$lib";
  import { customFieldTypeLabelMap, customFieldTypeOptions } from "$lib/feature/custom-field/custom-field-view-data";
  import Filter from "$lib/icons/Filter.svelte";

  interface Props {
    filtering: FilteringService;
  }

  let { filtering }: Props = $props();
  let open = $state(false);

  const config: FilterPanelConfig = {
    title: "Active filters",
    description: "Refine the custom fields table",
    fields: [
      {
        kind: "checkbox-group",
        id: "type",
        label: "Type",
        filterId: "type",
        operator: "IN",
        options: customFieldTypeOptions.map((type) => ({
          value: type,
          label: customFieldTypeLabelMap[type],
        })),
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
  title="Filter custom fields"
  description="Refine the custom fields table without taking over the whole page."
  onClose={closeFilters}
>
  <FilterPanel {filtering} {config} compact />

  {#snippet mobileFooter()}
    <Button class="w-full" onclick={closeFilters}>Apply filters</Button>
  {/snippet}
</ResponsiveDialog>
