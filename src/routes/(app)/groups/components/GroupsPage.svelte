<script lang="ts">
  import { onDestroy } from "svelte";
  import {
    Input,
    PageTitle,
    Table,
    accessorColumn,
    columnsFeature,
    createDataTable,
    filtersFeature,
    infiniteLoaderFeature,
    sortingFeature,
    virtualWindowFeature,
    type DataTable,
    type DataTableColumnDef,
  } from "$lib";
  import { ContactGroupsState } from "$lib/features/contact-groups/contact-groups-state.svelte";
  import type { ContactGroupViewModel } from "$lib/features/contact-groups/contact-groups-view-data";
  import GroupOverlays from "./GroupOverlays.svelte";

  const groupsState = new ContactGroupsState();
  let tableKey = groupsState.tableKey;

  const columns = [
    accessorColumn({
      accessorKey: "name",
      header: "Name",
      sortable: true,
      size: 280,
    }),
    accessorColumn({
      accessorKey: "contactCount",
      header: "Contacts",
      sortable: true,
      size: 140,
    }),
    accessorColumn({
      accessorKey: "id",
      header: "ID",
      sortable: false,
      size: 280,
    }),
  ] satisfies DataTableColumnDef<ContactGroupViewModel>[];

  let table = $state<DataTable<ContactGroupViewModel>>(createGroupsTable());

  $effect(() => {
    if (groupsState.tableKey === tableKey) {
      return;
    }

    tableKey = groupsState.tableKey;
    table = createGroupsTable();
  });

  onDestroy(() => groupsState.dispose());

  function createGroupsTable() {
    return createDataTable<ContactGroupViewModel>({
      emptyLabel: "No groups found",
      errorLabel: "Could not load groups.",
      getRowId: (group) => group.id,
      features: [
        columnsFeature({ columns }),
        sortingFeature({
          sorts: [{ sortId: "name", direction: "ascending" }],
        }),
        filtersFeature({ filters: [] }),
        infiniteLoaderFeature({
          loadRows: groupsState.fetchRows,
          pageSize: 50,
        }),
        virtualWindowFeature({
          height: "600px",
          threshold: 15,
        }),
      ],
    });
  }
</script>

<div
  class="relative flex h-full min-h-dvh flex-col rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:min-h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle title="Groups" />

  <div
    class="flex min-h-0 grow flex-col overflow-hidden rounded-2xl border border-white/70 bg-white/70
      shadow-[0_20px_45px_-25px_rgba(30,41,59,0.45)] backdrop-blur-md"
  >
    <div class="shrink-0 space-y-3 border-b border-white/70 bg-white/55 p-3 backdrop-blur-sm">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          class="min-w-0 grow"
          placeholder="Search groups"
          value={groupsState.search}
          oninput={(event) => groupsState.updateSearch(event.currentTarget.value)}
        />

        <div class="flex items-center gap-2">
          <button
            class={[
              `relative flex h-9 items-center gap-2 rounded-xl border bg-white/90 px-3 text-sm font-medium
                text-slate-700 shadow-sm hover:cursor-pointer hover:bg-white`,
              groupsState.filtersOpen ? "border-sky-300 bg-sky-50/90" : "border-white/80",
            ]}
            type="button"
            onclick={groupsState.openFilters}
          >
            <svg
              viewBox="0 0 24 24"
              class={["size-5", groupsState.filtersOpen ? "fill-sky-700" : "fill-slate-700"]}
              aria-hidden="true"
            >
              <path d="M3 5h18l-7 8v5l-4 2v-7L3 5z" />
            </svg>
            Filters
            <span
              class="flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-700 px-1 text-[10px]
                leading-4 text-white"
            >
              {table.filters.value.length}
            </span>
          </button>

          <button
            class={[
              `relative flex h-9 items-center gap-2 rounded-xl border bg-white/90 px-3 text-sm font-medium
                text-slate-700 shadow-sm hover:cursor-pointer hover:bg-white`,
              groupsState.sortOpen ? "border-sky-300 bg-sky-50/90" : "border-white/80",
            ]}
            type="button"
            onclick={groupsState.openSort}
          >
            <svg
              viewBox="0 0 24 24"
              class={["size-5", groupsState.sortOpen ? "fill-sky-700" : "fill-slate-700"]}
              aria-hidden="true"
            >
              <path d="M7 4h10v2H7V4zm-2 7h14v2H5v-2zm3 7h8v2H8v-2z" />
            </svg>
            Sort
            <span
              class="flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-700 px-1 text-[10px]
                leading-4 text-white"
            >
              {table.sorting.sorts.length}
            </span>
          </button>
        </div>
      </div>

      {#if groupsState.loadingError}
        <div class="text-amber-900 rounded-xl border border-amber-200/80 bg-amber-100/90 px-3 py-2 text-sm shadow-sm">
          {groupsState.loadingError}
        </div>
      {/if}
    </div>

    <div class="min-h-0 grow p-3">
      {#key table}
        <Table {table} />
      {/key}
    </div>
  </div>
</div>

<GroupOverlays state={groupsState} {table} />
