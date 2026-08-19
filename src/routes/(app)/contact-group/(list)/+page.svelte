<script lang="ts">
  import { Card, LinkButton, PageTitle, Table } from "$lib";
  import { PATH_CONTACT_GROUP_ADD } from "$lib/app/paths";
  import ContactGroupSearchInput from "./components/ContactGroupSearchInput.svelte";
  import FilterButton from "./components/filter/FilterButton.svelte";
  import SortButton from "./components/sort/SortButton.svelte";
  import { createContactGroupTable } from "./components/table/table.svelte";

  let search = $state("");
  const table = createContactGroupTable({ getSearch: () => search });
</script>

<div
  class="relative flex h-dvh min-h-0 flex-col gap-3 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle title="Contact Groups">
    <LinkButton href={PATH_CONTACT_GROUP_ADD}>Add contact group</LinkButton>
  </PageTitle>

  <Card variant="panel" class="shrink-0 space-y-3">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <ContactGroupSearchInput dataLoading={table.handlers.dataLoading} bind:value={search} />

      <div class="flex items-center gap-2">
        <FilterButton filtering={table.handlers.filtering} />
        <SortButton sorting={table.handlers.sorting} />
      </div>
    </div>
  </Card>

  <Card variant="table">
    <Table {table} loading={table.features.dataLoading.loading} error={table.features.dataLoading.error} />
  </Card>
</div>
