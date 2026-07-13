<script lang="ts">
  import { Card, LinkButton, PageTitle } from "$lib";
  import { PATH_CONTACT_ADD } from "$lib/app/paths";
  import ContactSearchInput from "./ContactSearchInput.svelte";
  import ContactExportButton from "./export/ContactExportButton.svelte";
  import FilterButton from "./filter/FilterButton.svelte";
  import ContactImportButton from "./import/ContactImportButton.svelte";
  import SortButton from "./sort/SortButton.svelte";
  import ContactTable from "./table/ContactTable.svelte";
  import { table } from "./table/table.svelte";

  let search = $state("");
</script>

<div
  class="relative flex h-dvh min-h-0 flex-col gap-3 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle title="Contacts">
    <div class="flex items-center gap-2">
      <LinkButton href={PATH_CONTACT_ADD}>Add contact</LinkButton>

      <ContactImportButton />

      <ContactExportButton
        snapshot={{
          filters: table.features.filtering.filters,
          search,
          sorting: table.features.sorting.sorts,
        }}
      />
    </div>
  </PageTitle>

  <Card variant="panel" class="shrink-0 space-y-3">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <ContactSearchInput bind:value={search} />

      <div class="flex items-center gap-2">
        <FilterButton filtering={table.handlers.filtering} />
        <SortButton sorting={table.handlers.sorting} />
      </div>
    </div>
  </Card>

  <ContactTable />
</div>
