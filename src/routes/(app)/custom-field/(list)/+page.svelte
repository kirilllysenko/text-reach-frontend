<script lang="ts">
  import { onMount } from "svelte";
  import { Card, LinkButton, PageTitle, Table } from "$lib";
  import { AccessGroup } from "$houdini/graphql/enums";
  import { PATH_CUSTOM_FIELD_ADD } from "$lib/app/paths";
  import { getSessionState } from "$lib/state/session.svelte";
  import { createFormValue } from "text-reach-frontend-library/form";
  import CustomFieldSearchInput from "./components/CustomFieldSearchInput.svelte";
  import FilterButton from "./components/filter/FilterButton.svelte";
  import SortButton from "./components/sort/SortButton.svelte";
  import { createCustomFieldTable } from "./components/table/table.svelte";

  const sessionState = getSessionState();

  const search = $state(createFormValue(""));
  const { query: customFieldsQuery, table } = createCustomFieldTable();
  const canWriteCustomFields = $derived(sessionState.hasAccess(AccessGroup.CUSTOM_FIELDS_WRITE));

  onMount(() =>
    customFieldsQuery.subscribe((result) => {
      if (result.data) {
        table.replaceData(result.data.customFields);
      }
    }),
  );
</script>

<div
  class="relative flex h-dvh min-h-0 flex-col gap-3 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle title="Custom Fields">
    {#if canWriteCustomFields}
      <LinkButton id="custom-field-add" href={PATH_CUSTOM_FIELD_ADD}>Add custom field</LinkButton>
    {/if}
  </PageTitle>

  <Card variant="panel" class="shrink-0 space-y-3">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <CustomFieldSearchInput search={table.handlers.globalSearch} field={search} />

      <div class="flex items-center gap-2">
        <FilterButton filtering={table.handlers.filtering} />
        <SortButton sorting={table.handlers.sorting} />
      </div>
    </div>
  </Card>

  <Card variant="table">
    <Table
      {table}
      loading={$customFieldsQuery.fetching}
      error={$customFieldsQuery.errors ? "There was an error." : null}
    />
  </Card>
</div>
