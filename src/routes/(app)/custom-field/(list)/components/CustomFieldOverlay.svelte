<script lang="ts">
  import { Button, ResponsiveDialog, SortPanel, type SortPanelController } from "$lib";
  import type { CustomFieldState } from "$lib/feature/custom-field/custom-field-state.svelte";
  import { customFieldSortFieldLabelMap } from "$lib/feature/custom-field/custom-field-view-data";

  interface Props {
    sorting: SortPanelController;
    state: CustomFieldState;
  }

  let { sorting, state }: Props = $props();

  const sortFieldOptions = $derived(
    state.sortFieldOptions.map((field) => ({
      value: field,
      label: customFieldSortFieldLabelMap[field],
    })),
  );
</script>

<ResponsiveDialog
  open={state.sortOpen}
  title="Sort custom fields"
  description="Adjust the priority stack for the custom fields table."
  onClose={state.closeOverlays}
>
  <SortPanel {sorting} fieldOptions={sortFieldOptions} compact />

  {#snippet mobileFooter()}
    <Button class="w-full" onclick={state.closeOverlays}>Apply sorting</Button>
  {/snippet}
</ResponsiveDialog>
