<script lang="ts">
  import type { MessageSortByInput } from "$houdini/graphql/inputs";
  import { Button, ResponsiveDialog, SortPanel, type SortingService } from "$lib";
  import Sort from "text-reach-frontend-library/icons/Sort.svelte";

  interface Props {
    sorting: SortingService<MessageSortByInput>;
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
  title="Sort messages"
  description="Adjust the priority stack for the messages table."
  onClose={closeSort}
>
  <SortPanel {sorting} />

  {#snippet mobileFooter()}
    <Button class="w-full" onclick={closeSort}>Apply sorting</Button>
  {/snippet}
</ResponsiveDialog>
