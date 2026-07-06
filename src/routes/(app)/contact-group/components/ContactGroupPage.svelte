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
    displayColumn,
    type ColumnDef,
    type DataTableLoadRequest,
    type DataTableSort,
  } from "$lib";
  import { PATH_CONTACT_GROUP_ADD } from "$lib/app/paths";
  import { ContactGroupState } from "$lib/feature/contact-group/contact-group-state.svelte";
  import Filter from "$lib/icons/Filter.svelte";
  import Sort from "$lib/icons/Sort.svelte";
  import type { ContactGroupViewModel } from "$lib/feature/contact-group/contact-group-view-data";
  import ContactGroupActionCell from "./ContactGroupActionCell.svelte";
  import ContactGroupOverlay from "./ContactGroupOverlay.svelte";

  const PAGE_SIZE = 500;
  const contactGroupState = new ContactGroupState();
  const initialSorting = [{ sortId: "name", direction: "ascending" }] satisfies DataTableSort[];

  let tableKey = contactGroupState.tableKey;
  let rows = $state<ContactGroupViewModel[]>([]);
  let loadingRows = $state(false);

  const filtering = createFilterController(() => void reloadRows());
  const sorting = createSortController(initialSorting, () => void reloadRows());

  function size(width: number) {
    return {
      maxWidth: Math.max(width * 3, 640),
      minWidth: Math.min(width, 96),
      width,
    };
  }

  const columns = [
    accessorColumn<ContactGroupViewModel, "name", unknown>({
      accessorKey: "name",
      header: "Name",
      options: { sortable: true },
      state: { size: size(280) },
    }),
    accessorColumn<ContactGroupViewModel, "contactCount", unknown>({
      accessorKey: "contactCount",
      header: "Contacts",
      options: { sortable: true },
      state: { size: size(140) },
    }),
    accessorColumn<ContactGroupViewModel, "id", unknown>({
      accessorKey: "id",
      header: "ID",
      options: { sortable: false },
      state: { size: size(280) },
    }),
    displayColumn<ContactGroupViewModel, unknown>({
      columnId: "actions",
      header: "",
      cell: ({ row }) => ({
        component: ContactGroupActionCell,
        props: { contactGroup: row.original },
      }),
      options: {
        hideable: false,
        moveable: false,
        pinnable: false,
        resizable: false,
      },
      state: {
        size: {
          maxWidth: 120,
          minWidth: 88,
          width: 88,
        },
      },
    }),
  ] satisfies ColumnDef<ContactGroupViewModel>[];

  let table = $state<DatagridCore<ContactGroupViewModel>>(createContactGroupTable([]));

  $effect(() => {
    if (contactGroupState.tableKey === tableKey) {
      return;
    }

    tableKey = contactGroupState.tableKey;
    void reloadRows();
  });

  onDestroy(() => contactGroupState.dispose());
  onMount(() => {
    void reloadRows();
  });

  function createContactGroupTable(data: ContactGroupViewModel[]) {
    return new DatagridCore<ContactGroupViewModel>({
      columns,
      data,
      dataFields: [
        {
          fieldId: "name",
          getValueFn: (contactGroup) => contactGroup.name,
          sortable: true,
        },
        {
          fieldId: "contactCount",
          getValueFn: (contactGroup) => contactGroup.contactCount,
          sortable: true,
        },
      ],
      initialState: {
        pagination: { pageSize: PAGE_SIZE },
        sorting: {
          sorts: sorting.sorts,
        },
      },
      rowIdGetter: (contactGroup) => contactGroup.id,
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
      const result = await contactGroupState.fetchRows(request);
      rows = result.rows;
      table = createContactGroupTable(rows);
    } finally {
      loadingRows = false;
    }
  }
</script>

{#snippet contactGroupEmpty()}
  No contact groups found
{/snippet}

{#snippet contactGroupLoadingError()}
  Could not load contact groups.
{/snippet}

<div
  class="relative flex h-dvh min-h-0 flex-col gap-3 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle title="Contact Groups">
    <a
      href={PATH_CONTACT_GROUP_ADD}
      class="flex h-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-700 px-3
        text-base font-medium text-white shadow-sm hover:bg-slate-800"
    >
      Add contact group
    </a>
  </PageTitle>

  <div
    class="shrink-0 space-y-3 rounded-2xl border border-white/70 bg-white/70 p-3
      shadow-[0_20px_45px_-25px_rgba(30,41,59,0.45)] backdrop-blur-md"
  >
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Input
        class="min-w-0 grow"
        placeholder="Search contact groups"
        value={contactGroupState.search}
        oninput={(event) => contactGroupState.updateSearch(event.currentTarget.value)}
      />

      <div class="flex items-center gap-2">
        <button
          class={[
            `relative flex h-9 items-center gap-2 rounded-xl border bg-white/90 px-3 text-sm font-medium
              text-slate-700 shadow-sm hover:cursor-pointer hover:bg-white`,
            contactGroupState.filtersOpen ? "border-sky-300 bg-sky-50/90" : "border-white/80",
          ]}
          type="button"
          onclick={contactGroupState.openFilters}
        >
          <Filter class={["size-5", contactGroupState.filtersOpen ? "fill-sky-700" : "fill-slate-700"]} />
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
            contactGroupState.sortOpen ? "border-sky-300 bg-sky-50/90" : "border-white/80",
          ]}
          type="button"
          onclick={contactGroupState.openSort}
        >
          <Sort class={["size-5", contactGroupState.sortOpen ? "fill-sky-700" : "fill-slate-700"]} />
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

    {#if contactGroupState.loadingError}
      <div class="text-amber-900 rounded-xl border border-amber-200/80 bg-amber-100/90 px-3 py-2 text-sm shadow-sm">
        {contactGroupState.loadingError}
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

<ContactGroupOverlay state={contactGroupState} {filtering} {sorting} />
