<script lang="ts">
  import { onDestroy } from "svelte";
  import { Button, Card, Input, PageTitle } from "$lib";
  import { PATH_CUSTOM_FIELD_ADD } from "$lib/app/paths";
  import { CustomFieldState } from "$lib/feature/custom-field/custom-field-state.svelte";
  import Sort from "$lib/icons/Sort.svelte";
  import CustomFieldOverlay from "./CustomFieldOverlay.svelte";
  import CustomFieldTable from "./table/CustomFieldTable.svelte";
  import { createCustomFieldTable } from "./table/table.svelte";

  const customFieldsState = new CustomFieldState();
  let tableKey = customFieldsState.tableKey;
  const table = createCustomFieldTable({ customFieldsState });

  $effect(() => {
    if (customFieldsState.tableKey === tableKey) {
      return;
    }

    tableKey = customFieldsState.tableKey;
    table.handlers.dataLoading.reload();
  });

  onDestroy(() => customFieldsState.dispose());
</script>

{#snippet customFieldsEmpty()}
  No custom fields found
{/snippet}

{#snippet customFieldsLoadingError()}
  Could not load custom fields.
{/snippet}

<div
  class="relative flex h-dvh min-h-0 flex-col gap-3 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle title="Custom Fields">
    <a
      href={PATH_CUSTOM_FIELD_ADD}
      class="flex h-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-700 px-3
        text-base font-medium text-white shadow-sm hover:bg-slate-800"
    >
      Add custom field
    </a>
  </PageTitle>

  <Card variant="panel" class="shrink-0 space-y-3">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Input
        class="min-w-0 grow"
        placeholder="Search custom fields"
        value={customFieldsState.search}
        oninput={(event) => customFieldsState.updateSearch(event.currentTarget.value)}
      />

      <div class="flex items-center gap-2">
        <Button
          variant="secondary"
          active={customFieldsState.sortOpen}
          icon={Sort}
          class="relative gap-2 text-sm"
          onclick={customFieldsState.openSort}
        >
          <span class="flex items-center gap-2">
            Sort
            <span
              class="flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-700 px-1 text-[10px]
                leading-4 text-white"
            >
              {table.features.sorting.sorts.length}
            </span>
          </span>
        </Button>
      </div>
    </div>

    {#if customFieldsState.loadingError}
      <div class="text-amber-900 rounded-xl border border-amber-200/80 bg-amber-100/90 px-3 py-2 text-sm shadow-sm">
        {customFieldsState.loadingError}
      </div>
    {/if}
  </Card>

  <CustomFieldTable {table} />
</div>

<CustomFieldOverlay state={customFieldsState} sorting={table.handlers.sorting} />
