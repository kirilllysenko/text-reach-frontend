<script lang="ts">
  import type { ContactFilterInput } from "$houdini/graphql/inputs";
  import { Button, FilterPanel, ResponsiveDialog, type FilteringService } from "$lib";
  import Filter from "text-reach-frontend-library/icons/Filter.svelte";

  interface Props {
    filtering: FilteringService<ContactFilterInput>;
  }

  let { filtering }: Props = $props();
  let open = $state(false);

  function openFilters(): void {
    open = true;
  }

  function closeFilters(): void {
    open = false;
  }
</script>

<Button
  id="table-filter-button"
  variant="secondary"
  active={open}
  icon={Filter}
  class="relative gap-2 text-sm"
  onclick={openFilters}
>
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
  id="table-filter-dialog"
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
