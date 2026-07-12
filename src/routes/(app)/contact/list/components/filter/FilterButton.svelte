<script lang="ts">
  import { Button, FilterPanel, ResponsiveDialog, type FilteringService } from "$lib";
  import Filter from "$lib/icons/Filter.svelte";

  interface Props {
    filtering: FilteringService;
  }

  let { filtering }: Props = $props();
  let open = $state(false);

  const visibleFilterIds = $derived(
    new Set(
      (filtering.filterDefinitions ?? [])
        .filter((definition) => !definition.hidden)
        .map((definition) => definition.filterId),
    ),
  );
  const activeFilterCount = $derived(
    filtering.filters.filter((filter) => visibleFilterIds.has(filter.filterId)).length,
  );

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
      {activeFilterCount}
    </span>
  </span>
</Button>

<ResponsiveDialog
  {open}
  title="Filter contacts"
  description="Refine the contact table without taking over the whole page."
  onClose={closeFilters}
>
  <FilterPanel {filtering} description="Refine the contact table" compact />

  {#snippet mobileFooter()}
    <Button class="w-full" onclick={closeFilters}>Apply filters</Button>
  {/snippet}
</ResponsiveDialog>
