<script lang="ts">
  import { page } from "$app/state";
  import { BackButton, Card, PageTitle, Table } from "$lib";
  import { phoneFilterState } from "$lib/state/phone-filter.svelte";
  import MessageExportButton from "./components/export/MessageExportButton.svelte";
  import FilterButton from "./components/filter/FilterButton.svelte";
  import MessageSearchInput from "./components/MessageSearchInput.svelte";
  import SortButton from "./components/sort/SortButton.svelte";
  import { createMessageTable } from "./components/table/table.svelte";

  let search = $state("");
  let loadedPhoneId = $state(phoneFilterState.selectedPhoneId);
  const table = createMessageTable({
    campaignId: page.params.id ?? "",
    getSearch: () => search,
    getTenantPhoneId: () => phoneFilterState.selectedPhoneId,
  });

  $effect(() => {
    const selectedPhoneId = phoneFilterState.selectedPhoneId;
    if (selectedPhoneId === loadedPhoneId) {
      return;
    }

    loadedPhoneId = selectedPhoneId;
    void table.handlers.dataLoading.reload();
  });
</script>

<div
  class="relative flex h-dvh min-h-0 flex-col gap-3 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle title="Campaign messages">
    <div class="flex items-center gap-2">
      <BackButton />
      <MessageExportButton
        snapshot={{
          campaignId: page.params.id ?? "",
          filters: table.features.filtering.filters,
          search,
          sorts: table.features.sorting.sorts,
          tenantPhoneId: phoneFilterState.selectedPhoneId,
        }}
      />
    </div>
  </PageTitle>

  <Card variant="panel" class="shrink-0 space-y-3">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <MessageSearchInput dataLoading={table.handlers.dataLoading} bind:value={search} />

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
