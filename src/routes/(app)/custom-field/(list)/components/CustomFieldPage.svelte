<script lang="ts">
  import { Card, LinkButton, PageTitle } from "$lib";
  import { PATH_CUSTOM_FIELD_ADD } from "$lib/app/paths";
  import { CustomFieldState } from "$lib/feature/custom-field/custom-field-state.svelte";
  import CustomFieldSearchInput from "./CustomFieldSearchInput.svelte";
  import FilterButton from "./filter/FilterButton.svelte";
  import SortButton from "./sort/SortButton.svelte";
  import CustomFieldTable from "./table/CustomFieldTable.svelte";
  import { createCustomFieldTable } from "./table/table.svelte";

  const customFieldsState = new CustomFieldState();
  const table = createCustomFieldTable({ customFieldsState });
</script>

<div
  class="relative flex h-dvh min-h-0 flex-col gap-3 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle title="Custom Fields">
    <LinkButton href={PATH_CUSTOM_FIELD_ADD}>Add custom field</LinkButton>
  </PageTitle>

  <Card variant="panel" class="shrink-0 space-y-3">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <CustomFieldSearchInput dataLoading={table.handlers.dataLoading} bind:value={customFieldsState.search} />

      <div class="flex items-center gap-2">
        <FilterButton filtering={table.handlers.filtering} />
        <SortButton sorting={table.handlers.sorting} />
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
