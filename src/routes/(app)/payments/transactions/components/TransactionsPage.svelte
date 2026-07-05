<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import {
    DatagridCore,
    Input,
    PageTitle,
    Table,
    accessorColumn,
    createFilterController,
    createSortController,
    type ColumnDef,
    type DataTableLoadRequest,
    type DataTableSort,
  } from "$lib";
  import { PATH_PAYMENTS } from "$lib/app/paths";
  import { WalletTransactionsState } from "$lib/features/payments/payments-state.svelte";
  import type { WalletTransactionViewModel } from "$lib/features/payments/payments-view-data";
  import TransactionOverlays from "./TransactionOverlays.svelte";

  const PAGE_SIZE = 500;
  const transactionsState = new WalletTransactionsState();
  const initialSorting = [{ sortId: "createdAt", direction: "descending" }] satisfies DataTableSort[];

  let tableKey = transactionsState.tableKey;
  let rows = $state<WalletTransactionViewModel[]>([]);
  let loadingRows = $state(false);

  const filtering = createFilterController(() => void reloadRows());
  const sorting = createSortController(initialSorting, () => void reloadRows());

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

  let table = $state<DatagridCore<WalletTransactionViewModel>>(createTransactionsTable([]));

  $effect(() => {
    if (transactionsState.tableKey === tableKey) {
      return;
    }

    tableKey = transactionsState.tableKey;
    void reloadRows();
  });

  onDestroy(() => transactionsState.dispose());
  onMount(() => {
    void reloadRows();
  });

  function createTransactionsTable(data: WalletTransactionViewModel[]) {
    return new DatagridCore<WalletTransactionViewModel>({
      columns,
      data,
      dataFields: [
        {
          fieldId: "createdAt",
          getValueFn: (transaction) => transaction.createdAt,
          sortable: true,
        },
        {
          fieldId: "amountUsdMicros",
          getValueFn: (transaction) => transaction.amountUsdMicros,
          sortable: true,
        },
      ],
      initialState: {
        pagination: { pageSize: PAGE_SIZE },
        sorting: {
          sortConfigs: sorting.sorts.map((sort) => ({
            direction: sort.direction,
            fieldId: sort.sortId,
          })),
        },
      },
      rowIdGetter: (transaction) => transaction.id,
    });
  }

  async function reloadRows(): Promise<void> {
    loadingRows = true;

    const request = {
      cursor: null,
      filters: filtering.filters,
      limit: PAGE_SIZE,
      sorting: sorting.sorts,
    } satisfies DataTableLoadRequest;

    try {
      const result = await transactionsState.fetchRows(request);
      rows = result.rows;
      table = createTransactionsTable(rows);
    } finally {
      loadingRows = false;
    }
  }
</script>

<div
  class="relative flex h-dvh min-h-0 flex-col gap-3 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle title="Transactions">
    <a
      href={PATH_PAYMENTS}
      class="flex h-9 items-center justify-center rounded-xl border border-white/80 bg-white/90 px-3
        text-sm font-medium text-slate-700 shadow-sm hover:bg-white"
    >
      Balance
    </a>
  </PageTitle>

  <div
    class="shrink-0 space-y-3 rounded-2xl border border-white/70 bg-white/70 p-3
      shadow-[0_20px_45px_-25px_rgba(30,41,59,0.45)] backdrop-blur-md"
  >
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Input
        class="min-w-0 grow"
        placeholder="Search transaction or source ID"
        value={transactionsState.idSearch}
        oninput={(event) => transactionsState.updateIdSearch(event.currentTarget.value)}
      />

      <div class="flex items-center gap-2">
        <button
          class={[
            `relative flex h-9 items-center gap-2 rounded-xl border bg-white/90 px-3 text-sm font-medium
              text-slate-700 shadow-sm hover:cursor-pointer hover:bg-white`,
            transactionsState.filtersOpen ? "border-sky-300 bg-sky-50/90" : "border-white/80",
          ]}
          type="button"
          onclick={transactionsState.openFilters}
        >
          <svg
            viewBox="0 0 24 24"
            class={["size-5", transactionsState.filtersOpen ? "fill-sky-700" : "fill-slate-700"]}
            aria-hidden="true"
          >
            <path d="M3 5h18l-7 8v5l-4 2v-7L3 5z" />
          </svg>
          Filters
          <span
            class="flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-700 px-1 text-[10px]
              leading-4 text-white"
          >
            {filtering.filters.length}
          </span>
        </button>

        <button
          class={[
            `relative flex h-9 items-center gap-2 rounded-xl border bg-white/90 px-3 text-sm font-medium
              text-slate-700 shadow-sm hover:cursor-pointer hover:bg-white`,
            transactionsState.sortOpen ? "border-sky-300 bg-sky-50/90" : "border-white/80",
          ]}
          type="button"
          onclick={transactionsState.openSort}
        >
          <svg
            viewBox="0 0 24 24"
            class={["size-5", transactionsState.sortOpen ? "fill-sky-700" : "fill-slate-700"]}
            aria-hidden="true"
          >
            <path d="M7 4h10v2H7V4zm-2 7h14v2H5v-2zm3 7h8v2H8v-2z" />
          </svg>
          Sort
          <span
            class="flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-700 px-1 text-[10px]
              leading-4 text-white"
          >
            {sorting.sorts.length}
          </span>
        </button>
      </div>
    </div>

    {#if transactionsState.activeIdSearchIsInvalid}
      <div class="text-amber-900 rounded-xl border border-amber-200/80 bg-amber-100/90 px-3 py-2 text-sm">
        Enter a full transaction or source ID to search by ID.
      </div>
    {/if}

    {#if transactionsState.loadingError}
      <div class="text-amber-900 rounded-xl border border-amber-200/80 bg-amber-100/90 px-3 py-2 text-sm">
        {transactionsState.loadingError}
      </div>
    {/if}
  </div>

  <div
    class="flex min-h-0 grow flex-col overflow-hidden rounded-2xl border border-white/70 bg-white/70 p-0
      shadow-[0_20px_45px_-25px_rgba(30,41,59,0.45)] backdrop-blur-md"
  >
    {#key table}
      <Table {table} loading={loadingRows} />
    {/key}
  </div>
</div>

<TransactionOverlays state={transactionsState} {filtering} {sorting} />
