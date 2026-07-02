<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import {
    DatagridCore,
    Input,
    PageTitle,
    Table,
    accessorColumn,
    createSortController,
    displayColumn,
    type ColumnDef,
    type DataTableLoadRequest,
    type DataTableSort,
  } from "$lib";
  import { PATH_CUSTOM_FIELD_ADD } from "$lib/app/paths";
  import { CustomFieldsState } from "$lib/features/custom-fields/custom-fields-state.svelte";
  import type { CustomFieldViewModel } from "$lib/features/custom-fields/custom-fields-view-data";
  import CustomFieldActionsCell from "./CustomFieldActionsCell.svelte";
  import CustomFieldOverlays from "./CustomFieldOverlays.svelte";

  const PAGE_SIZE = 500;
  const customFieldsState = new CustomFieldsState();
  const initialSorting = [{ sortId: "name", direction: "ascending" }] satisfies DataTableSort[];

  let tableKey = customFieldsState.tableKey;
  let rows = $state<CustomFieldViewModel[]>([]);
  let loadingRows = $state(false);

  const sorting = createSortController(initialSorting, () => void reloadRows());

  function size(width: number, maxWidth: number) {
    return {
      maxWidth,
      minWidth: Math.min(width, 96),
      width,
    };
  }

  const columns = [
    accessorColumn<CustomFieldViewModel, "name", unknown>({
      accessorKey: "name",
      header: "Name",
      options: { sortable: true },
      state: { size: size(280, 1200) },
    }),
    accessorColumn<CustomFieldViewModel, "typeLabel", unknown>({
      accessorKey: "typeLabel",
      columnId: "type",
      header: "Type",
      options: { sortable: true },
      state: { size: size(160, 320) },
    }),
    displayColumn<CustomFieldViewModel, unknown>({
      columnId: "actions",
      header: "",
      cell: ({ row }) => ({
        component: CustomFieldActionsCell,
        props: { field: row.original },
      }),
      options: {
        hideable: false,
        moveable: false,
        pinnable: false,
        resizable: false,
      },
      state: { size: size(88, 120) },
    }),
  ] satisfies ColumnDef<CustomFieldViewModel>[];

  let table = $state<DatagridCore<CustomFieldViewModel>>(createCustomFieldsTable([]));

  $effect(() => {
    if (customFieldsState.tableKey === tableKey) {
      return;
    }

    tableKey = customFieldsState.tableKey;
    void reloadRows();
  });

  onDestroy(() => customFieldsState.dispose());
  onMount(() => {
    void reloadRows();
  });

  function createCustomFieldsTable(data: CustomFieldViewModel[]) {
    return new DatagridCore<CustomFieldViewModel>({
      columns,
      data,
      initialState: {
        pagination: { pageSize: PAGE_SIZE },
        sorting: {
          sortConfigs: sorting.sorts.map((sort) => ({
            direction: sort.direction,
            fieldId: sort.sortId,
          })),
        },
      },
      rowIdGetter: (field) => field.id,
    });
  }

  async function reloadRows(): Promise<void> {
    loadingRows = true;

    const request = {
      cursor: null,
      filters: [],
      limit: PAGE_SIZE,
      sorting: sorting.sorts,
    } satisfies DataTableLoadRequest;

    try {
      const result = await customFieldsState.fetchRows(request);
      rows = result.rows;
      table = createCustomFieldsTable(rows);
    } finally {
      loadingRows = false;
    }
  }
</script>

{#snippet customFieldsEmpty()}
  No custom fields found
{/snippet}

{#snippet customFieldsLoadingError()}
  Could not load custom fields.
{/snippet}

<div
  class="relative flex h-dvh min-h-0 flex-col gap-3 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle title="Custom Fields">
    <a
      href={PATH_CUSTOM_FIELD_ADD}
      class="flex h-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-700 px-3
        text-base font-medium text-white shadow-sm hover:bg-slate-800"
    >
      Add custom field
    </a>
  </PageTitle>

  <div
    class="shrink-0 space-y-3 rounded-2xl border border-white/70 bg-white/70 p-3
      shadow-[0_20px_45px_-25px_rgba(30,41,59,0.45)] backdrop-blur-md"
  >
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Input
        class="min-w-0 grow"
        placeholder="Search custom fields"
        value={customFieldsState.search}
        oninput={(event) => customFieldsState.updateSearch(event.currentTarget.value)}
      />

      <div class="flex items-center gap-2">
        <button
          class={[
            `relative flex h-9 items-center gap-2 rounded-xl border bg-white/90 px-3 text-sm font-medium
              text-slate-700 shadow-sm hover:cursor-pointer hover:bg-white`,
            customFieldsState.sortOpen ? "border-sky-300 bg-sky-50/90" : "border-white/80",
          ]}
          type="button"
          onclick={customFieldsState.openSort}
        >
          <svg
            viewBox="0 0 24 24"
            class={["size-5", customFieldsState.sortOpen ? "fill-sky-700" : "fill-slate-700"]}
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

    {#if customFieldsState.loadingError}
      <div class="text-amber-900 rounded-xl border border-amber-200/80 bg-amber-100/90 px-3 py-2 text-sm shadow-sm">
        {customFieldsState.loadingError}
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

<CustomFieldOverlays state={customFieldsState} {sorting} />
