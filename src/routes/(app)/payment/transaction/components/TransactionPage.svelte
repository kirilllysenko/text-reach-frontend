<script lang="ts">
  import { BackButton, Card, PageTitle } from "$lib";
  import { PATH_PAYMENT } from "$lib/app/paths";
  import { WalletTransactionState } from "$lib/feature/payment/payment-state.svelte";
  import FilterButton from "./filter/FilterButton.svelte";
  import SortButton from "./sort/SortButton.svelte";
  import TransactionSearchInput from "./TransactionSearchInput.svelte";
  import TransactionTable from "./table/TransactionTable.svelte";
  import { createTransactionTable } from "./table/table.svelte";

  const transactionState = new WalletTransactionState();
  const table = createTransactionTable({ transactionState });
</script>

<div
  class="relative flex h-dvh min-h-0 flex-col gap-3 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle title="Transactions">
    <BackButton href={PATH_PAYMENT}>Balance</BackButton>
  </PageTitle>

  <Card variant="panel" class="shrink-0 space-y-3">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <TransactionSearchInput dataLoading={table.handlers.dataLoading} bind:value={transactionState.idSearch} />

      <div class="flex items-center gap-2">
        <FilterButton filtering={table.handlers.filtering} />
        <SortButton sorting={table.handlers.sorting} />
      </div>
    </div>

    {#if transactionState.activeIdSearchIsInvalid}
      <div class="text-amber-900 rounded-xl border border-amber-200/80 bg-amber-100/90 px-3 py-2 text-sm shadow-sm">
        Enter a full transaction or source ID to search by ID.
      </div>
    {/if}

    {#if transactionState.loadingError}
      <div class="text-amber-900 rounded-xl border border-amber-200/80 bg-amber-100/90 px-3 py-2 text-sm shadow-sm">
        {transactionState.loadingError}
      </div>
    {/if}
  </Card>

  <TransactionTable {table} />
</div>
