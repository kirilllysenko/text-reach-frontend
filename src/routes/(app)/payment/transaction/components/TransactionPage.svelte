<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import {
    Button,
    Card,
    Input,
    PageTitle,
    Table,
    accessorColumn,
    comparisonFilter,
    createDatagrid,
    textFilter,
    type ColumnDef,
  } from "$lib";
  import { PATH_PAYMENT } from "$lib/app/paths";
  import { WalletTransactionState } from "$lib/feature/payment/payment-state.svelte";
  import Filter from "$lib/icons/Filter.svelte";
  import Sort from "$lib/icons/Sort.svelte";
  import {
    defaultWalletTransactionSorts,
    walletTransactionSortDefinitions,
    type WalletTransactionViewModel,
  } from "$lib/feature/payment/payment-view-data";
  import TransactionOverlay from "./TransactionOverlay.svelte";

  const PAGE_SIZE = 500;
  const transactionState = new WalletTransactionState();
  let tableKey = transactionState.tableKey;

  function size(width: number, maxWidth: number) {
    return {
      maxWidth,
      minWidth: Math.min(width, 96),
      width,
    };
  }

  const columns = [
    accessorColumn<WalletTransactionViewModel, "createdAtDisplay", unknown>({
      accessorKey: "createdAtDisplay",
      columnId: "createdAt",
      header: "Created",
      options: { sortable: true },
      state: { size: size(190, 360) },
    }),
    accessorColumn<WalletTransactionViewModel, "amountDisplay", unknown>({
      accessorKey: "amountDisplay",
      columnId: "amountUsdMicros",
      header: "Amount",
      options: { sortable: true },
      state: { size: size(140, 220) },
    }),
    accessorColumn<WalletTransactionViewModel, "currency", unknown>({
      accessorKey: "currency",
      header: "Currency",
      options: { sortable: true },
      state: { size: size(120, 180) },
    }),
    accessorColumn<WalletTransactionViewModel, "entryTypeLabel", unknown>({
      accessorKey: "entryTypeLabel",
      columnId: "entryType",
      header: "Entry Type",
      options: { sortable: true },
      state: { size: size(150, 260) },
    }),
    accessorColumn<WalletTransactionViewModel, "sourceTypeLabel", unknown>({
      accessorKey: "sourceTypeLabel",
      columnId: "sourceType",
      header: "Source Type",
      options: { sortable: true },
      state: { size: size(150, 260) },
    }),
    accessorColumn<WalletTransactionViewModel, "sourceId", unknown>({
      accessorKey: "sourceId",
      header: "Source ID",
      state: { size: size(280, 520) },
    }),
    accessorColumn<WalletTransactionViewModel, "id", unknown>({
      accessorKey: "id",
      header: "Transaction ID",
      state: { size: size(280, 520) },
    }),
  ] satisfies ColumnDef<WalletTransactionViewModel>[];

  const table = createTransactionTable();

  $effect(() => {
    if (transactionState.tableKey === tableKey) {
      return;
    }

    tableKey = transactionState.tableKey;
    void table.handlers.dataLoading.reload("search");
  });

  onMount(() => {
    table.handlers.dataLoading.start();
  });

  onDestroy(() => {
    table.handlers.dataLoading.dispose();
    transactionState.dispose();
  });

  function createTransactionTable() {
    return createDatagrid<WalletTransactionViewModel>()({
      columns,
      data: [],
      dataFields: [
        {
          fieldId: "createdAt",
          getValueFn: (transaction) => transaction.createdAt,
          filterable: true,
          sortable: true,
        },
        {
          fieldId: "amountUsdMicros",
          getValueFn: (transaction) => transaction.amountUsdMicros,
          filterable: true,
          sortable: true,
        },
        {
          fieldId: "currency",
          getValueFn: (transaction) => transaction.currency,
          filterable: true,
          sortable: true,
        },
        {
          fieldId: "entryType",
          getValueFn: (transaction) => transaction.entryType,
          filterable: true,
          sortable: true,
        },
        {
          fieldId: "sourceType",
          getValueFn: (transaction) => transaction.sourceType,
          filterable: true,
          sortable: true,
        },
      ],
      initialState: {
        dataLoading: {
          loader: (request) => transactionState.fetchRows(request),
        },
        filtering: {
          filterDefinitions: [
            comparisonFilter({
              filterId: "minAmount",
              fieldId: "amountUsdMicros",
              label: "Min amount",
              defaultOperator: "GREATER_OR_EQUAL",
            }),
            comparisonFilter({
              filterId: "maxAmount",
              fieldId: "amountUsdMicros",
              label: "Max amount",
              defaultOperator: "LESS_OR_EQUAL",
            }),
            comparisonFilter({
              filterId: "createdFrom",
              fieldId: "createdAt",
              label: "Created from",
              defaultOperator: "GREATER_OR_EQUAL",
            }),
            comparisonFilter({
              filterId: "createdTo",
              fieldId: "createdAt",
              label: "Created to",
              defaultOperator: "LESS_OR_EQUAL",
            }),
            textFilter({ filterId: "currency", fieldId: "currency", label: "Currency", defaultOperator: "CONTAINS" }),
            textFilter({
              filterId: "entryType",
              fieldId: "entryType",
              label: "Entry type",
              defaultOperator: "CONTAINS",
            }),
            textFilter({
              filterId: "sourceType",
              fieldId: "sourceType",
              label: "Source type",
              defaultOperator: "CONTAINS",
            }),
          ],
        },
        pagination: {
          manual: true,
          pageSize: PAGE_SIZE,
        },
        sorting: {
          sortDefinitions: walletTransactionSortDefinitions,
          sorts: defaultWalletTransactionSorts,
        },
      },
      rowIdGetter: (transaction) => transaction.id,
    });
  }
</script>

<div
  class="relative flex h-dvh min-h-0 flex-col gap-3 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle title="Transactions">
    <a
      href={PATH_PAYMENT}
      class="flex h-9 items-center justify-center rounded-xl border border-white/80 bg-white/90 px-3
        text-sm font-medium text-slate-700 shadow-sm hover:bg-white"
    >
      Balance
    </a>
  </PageTitle>

  <Card variant="panel" class="shrink-0 space-y-3">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Input
        class="min-w-0 grow"
        placeholder="Search transaction or source ID"
        value={transactionState.idSearch}
        oninput={(event) => transactionState.updateIdSearch(event.currentTarget.value)}
      />

      <div class="flex items-center gap-2">
        <Button
          variant="secondary"
          active={transactionState.filtersOpen}
          icon={Filter}
          class="relative gap-2 text-sm"
          onclick={transactionState.openFilters}
        >
          <span class="flex items-center gap-2">
            Filters
            <span
              class="flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-700 px-1 text-[10px]
                leading-4 text-white"
            >
              {table.features.filtering.filters.length}
            </span>
          </span>
        </Button>

        <Button
          variant="secondary"
          active={transactionState.sortOpen}
          icon={Sort}
          class="relative gap-2 text-sm"
          onclick={transactionState.openSort}
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

    {#if transactionState.activeIdSearchIsInvalid}
      <div class="text-amber-900 rounded-xl border border-amber-200/80 bg-amber-100/90 px-3 py-2 text-sm">
        Enter a full transaction or source ID to search by ID.
      </div>
    {/if}

    {#if transactionState.loadingError}
      <div class="text-amber-900 rounded-xl border border-amber-200/80 bg-amber-100/90 px-3 py-2 text-sm">
        {transactionState.loadingError}
      </div>
    {/if}
  </Card>

  <Card variant="table">
    <Table {table} loading={table.features.dataLoading.loading} />
  </Card>
</div>

<TransactionOverlay state={transactionState} filtering={table.handlers.filtering} sorting={table.handlers.sorting} />
