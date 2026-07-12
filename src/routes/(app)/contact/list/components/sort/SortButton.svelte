<script lang="ts">
  import { Button, ResponsiveDialog, SortPanel, type DataTableSortDefinition, type SortPanelController } from "$lib";
  import Sort from "$lib/icons/Sort.svelte";

  interface SortingServiceController extends SortPanelController {
    sortDefinitions: readonly DataTableSortDefinition[];
  }

  interface Props {
    sorting: SortingServiceController;
  }

  let { sorting }: Props = $props();
  let open = $state(false);

  const sortFieldOptions = $derived(
    sorting.sortDefinitions.map((definition) => ({
      value: definition.sortId,
      label: definition.label ?? definition.sortId,
    })),
  );

  function openSort(): void {
    open = true;
  }

  function closeSort(): void {
    open = false;
  }
</script>

<Button variant="secondary" active={open} icon={Sort} class="relative gap-2 text-sm" onclick={openSort}>
  <span class="flex items-center gap-2">
    Sort
    <span
      class="flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-700 px-1 text-[10px]
        leading-4 text-white"
    >
      {sorting.sorts.length}
    </span>
  </span>
</Button>

<ResponsiveDialog
  {open}
  title="Sort contacts"
  description="Adjust the priority stack for the contact table."
  onClose={closeSort}
>
  <SortPanel {sorting} fieldOptions={sortFieldOptions} compact />

  {#snippet mobileFooter()}
    <Button class="w-full" onclick={closeSort}>Apply sorting</Button>
  {/snippet}
</ResponsiveDialog>
