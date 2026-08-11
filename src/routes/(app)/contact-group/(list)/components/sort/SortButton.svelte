<script lang="ts">
  import type { ContactGroupSortByInput } from "$houdini/graphql/inputs";
  import { Button, ResponsiveDialog, SortPanel, type SortingService } from "$lib";
  import Sort from "$lib/icons/Sort.svelte";

  interface Props {
    sorting: SortingService<ContactGroupSortByInput>;
  }

  let { sorting }: Props = $props();
  let open = $state(false);

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
  title="Sort contact groups"
  description="Adjust the priority stack for the contact groups table."
  onClose={closeSort}
>
  <SortPanel {sorting} />

  {#snippet mobileFooter()}
    <Button class="w-full" onclick={closeSort}>Apply sorting</Button>
  {/snippet}
</ResponsiveDialog>
