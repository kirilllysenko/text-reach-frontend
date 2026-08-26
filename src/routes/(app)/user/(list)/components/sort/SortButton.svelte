<script lang="ts">
  import { Button, ResponsiveDialog, SortPanel, type SortingService } from "$lib";
  import Sort from "text-reach-frontend-library/icons/Sort.svelte";

  interface Props {
    sorting: SortingService;
  }

  let { sorting }: Props = $props();
  let open = $state(false);
</script>

<Button
  id="table-sort-button"
  variant="secondary"
  active={open}
  icon={Sort}
  class="relative gap-2 text-sm"
  onclick={() => (open = true)}
>
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
  id="table-sort-dialog"
  {open}
  title="Sort users"
  description="Adjust the priority stack for the users table."
  onClose={() => (open = false)}
>
  <SortPanel {sorting} />

  {#snippet mobileFooter()}
    <Button class="w-full" onclick={() => (open = false)}>Apply sorting</Button>
  {/snippet}
</ResponsiveDialog>
