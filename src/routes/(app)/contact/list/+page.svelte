<script lang="ts">
  import { AccessGate, Card, LinkButton, PageTitle } from "$lib";
  import { AccessGroup } from "$lib/api/index.schemas";
  import { PATH_CONTACT_ADD } from "$lib/app/paths";
  import ContactSearchInput from "./components/ContactSearchInput.svelte";
  import ContactExportButton from "./components/export/ContactExportButton.svelte";
  import FilterButton from "./components/filter/FilterButton.svelte";
  import ContactImportButton from "./components/import/ContactImportButton.svelte";
  import SortButton from "./components/sort/SortButton.svelte";
  import ContactTable from "./components/table/ContactTable.svelte";
  import { table } from "./components/table/table.svelte";

  let search = $state("");

  function updateSearchFilter(nextSearch: string): void {
    search = nextSearch;
    const normalizedSearch = nextSearch.trim();

    if (!normalizedSearch) {
      table.handlers.filtering.removeFilter("search");
      return;
    }

    table.handlers.filtering.setFilter("search", {
      filterId: "search",
      operator: "CONTAINS",
      type: "text",
      value: normalizedSearch,
    });
  }
</script>

{#snippet contactsEmpty()}
  No contacts found
{/snippet}

{#snippet contactsLoadingError()}
  Could not load contacts.
{/snippet}

<div
  class="relative flex h-dvh min-h-0 flex-col gap-3 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle title="Contacts">
    <div class="flex items-center gap-2">
      <AccessGate access={AccessGroup.CONTACT_WRITE}>
        <LinkButton href={PATH_CONTACT_ADD}>Add contact</LinkButton>
      </AccessGate>

      <AccessGate access={AccessGroup.CONTACT_WRITE}>
        <ContactImportButton />
      </AccessGate>

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
      <ContactSearchInput bind:value={search} onSearchChange={updateSearchFilter} />

      <div class="flex items-center gap-2">
        <FilterButton filtering={table.handlers.filtering} />
        <SortButton sorting={table.handlers.sorting} />
      </div>
    </div>
  </Card>

  <ContactTable />
</div>
