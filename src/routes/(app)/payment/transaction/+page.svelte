<script lang="ts">
  import { BackButton, Card, PageTitle, Table } from "$lib";
  import { createFormValue } from "text-reach-frontend-library/form";
  import FilterButton from "./components/filter/FilterButton.svelte";
  import SortButton from "./components/sort/SortButton.svelte";
  import TransactionSearchInput from "./components/TransactionSearchInput.svelte";
  import { createTransactionTable, isWalletTransactionId } from "./components/table/table.svelte";

  const idSearch = $state(createFormValue(""));
  const activeIdSearchIsInvalid = $derived(Boolean(idSearch.value.trim()) && !isWalletTransactionId(idSearch.value));
  const table = createTransactionTable({ getIdSearch: () => idSearch.value });
</script>

<div
  class="relative flex h-dvh min-h-0 flex-col gap-3 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle title="Transactions">
    <BackButton>Balance</BackButton>
  </PageTitle>

  <Card variant="panel" class="shrink-0 space-y-3">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <TransactionSearchInput dataLoading={table.handlers.dataLoading} field={idSearch} />

      <div class="flex items-center gap-2">
        <FilterButton filtering={table.handlers.filtering} />
        <SortButton sorting={table.handlers.sorting} />
      </div>
    </div>

    {#if activeIdSearchIsInvalid}
      <div class="text-amber-900 rounded-xl border border-amber-200/80 bg-amber-100/90 px-3 py-2 text-sm shadow-sm">
        Enter a full transaction or source ID to search by ID.
      </div>
    {/if}
  </Card>

  <Card variant="table">
    <Table {table} loading={table.features.dataLoading.loading} error={table.features.dataLoading.error} />
  </Card>
</div>
