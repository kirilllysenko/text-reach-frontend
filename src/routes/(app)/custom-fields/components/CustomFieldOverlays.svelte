<script lang="ts">
  import { ResponsiveDialog, SortPanel, createSortController } from "$lib";
  import type { CustomFieldsState } from "$lib/features/custom-fields/custom-fields-state.svelte";
  import { customFieldSortFieldLabelMap } from "$lib/features/custom-fields/custom-fields-view-data";

  interface Props {
    sorting: ReturnType<typeof createSortController>;
    state: CustomFieldsState;
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
    <button
      class="h-10 w-full rounded-xl bg-slate-700 text-sm font-medium text-white shadow-sm
        hover:cursor-pointer hover:bg-slate-800"
      type="button"
      onclick={state.closeOverlays}
    >
      Apply sorting
    </button>
  {/snippet}
</ResponsiveDialog>
