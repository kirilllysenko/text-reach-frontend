<script lang="ts">
  import { Card, LinkButton, PageTitle, Table } from "$lib";
  import { PATH_CONTACT_ADD } from "$lib/app/paths";
  import type { ContactFilterInput } from "$houdini/graphql/inputs";
  import ContactDeleteButton from "./components/ContactDeleteButton.svelte";
  import ContactSearchInput from "./components/ContactSearchInput.svelte";
  import ContactExportButton from "./components/export/ContactExportButton.svelte";
  import FilterButton from "./components/filter/FilterButton.svelte";
  import ContactImportButton from "./components/import/ContactImportButton.svelte";
  import SortButton from "./components/sort/SortButton.svelte";
  import { createContactTable } from "./components/table/table.svelte";

  let search = $state("");
  const table = createContactTable();
  const selectedContactIds = $derived(
    table.features.rowSelection.getSelectedRowsIds().map((identifier) => String(identifier)),
  );
  const selectedContactFilter = $derived<ContactFilterInput | null>(
    selectedContactIds.length > 0 ? { id: { in: selectedContactIds } } : null,
  );

  async function refreshContacts(): Promise<void> {
    await table.handlers.dataLoading.reload();
  }

  async function refreshAfterDelete(): Promise<void> {
    table.features.rowSelection.clearSelection();
    await refreshContacts();
  }
</script>

<div
  class="relative flex h-dvh min-h-0 flex-col gap-3 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle title="Contacts">
    <div class="flex items-center gap-2">
      <LinkButton href={PATH_CONTACT_ADD}>Add contact</LinkButton>

      <ContactImportButton onImported={refreshContacts} />

      <ContactExportButton
        snapshot={{
          filters: table.features.filtering.filters,
          search,
          sorts: table.features.sorting.sorts,
        }}
      />
    </div>
  </PageTitle>

  <Card variant="panel" class="shrink-0 space-y-3">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <ContactSearchInput bind:value={search} filtering={table.handlers.filtering} />

      <div class="flex items-center gap-2">
        <FilterButton filtering={table.handlers.filtering} />
        <SortButton sorting={table.handlers.sorting} />
        <ContactDeleteButton
          filter={selectedContactFilter}
          onDeleted={refreshAfterDelete}
          selectedCount={selectedContactIds.length}
        />
      </div>
    </div>
  </Card>

  <Card variant="table">
    <Table {table} loading={table.features.dataLoading.loading} error={table.features.dataLoading.error} />
  </Card>
</div>
