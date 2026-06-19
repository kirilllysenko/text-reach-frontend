<script lang="ts">
  import { onDestroy } from "svelte";
  import { DataTable, Input, PageTitle, type DataTableColumn } from "$lib";
  import { CustomFieldsState } from "$lib/features/custom-fields/custom-fields-state.svelte";
  import type { CustomFieldViewModel } from "$lib/features/custom-fields/custom-fields-view-data";
  import CustomFieldOverlays from "./CustomFieldOverlays.svelte";

  const customFieldsState = new CustomFieldsState();

  const columns: DataTableColumn<CustomFieldViewModel>[] = [
    {
      id: "name",
      header: "Name",
      accessor: (field) => field.name,
      size: 280,
    },
    {
      id: "type",
      header: "Type",
      accessor: (field) => field.typeLabel,
      size: 160,
    },
    {
      id: "position",
      header: "Position",
      accessor: (field) => field.position,
      size: 140,
    },
    {
      id: "id",
      header: "ID",
      accessor: (field) => field.id,
      size: 280,
    },
  ];

  onDestroy(() => customFieldsState.dispose());
</script>

<div
  class="relative flex h-full min-h-dvh flex-col rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:min-h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle title="Custom Fields" />

  <div
    class="flex min-h-0 grow flex-col overflow-hidden rounded-2xl border border-white/70 bg-white/70
      shadow-[0_20px_45px_-25px_rgba(30,41,59,0.45)] backdrop-blur-md"
  >
    <div class="shrink-0 space-y-3 border-b border-white/70 bg-white/55 p-3 backdrop-blur-sm">
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
              customFieldsState.filtersOpen ? "border-sky-300 bg-sky-50/90" : "border-white/80",
            ]}
            type="button"
            onclick={customFieldsState.openFilters}
          >
            <svg
              viewBox="0 0 24 24"
              class={["size-5", customFieldsState.filtersOpen ? "fill-sky-700" : "fill-slate-700"]}
              aria-hidden="true"
            >
              <path d="M3 5h18l-7 8v5l-4 2v-7L3 5z" />
            </svg>
            Filters
            <span
              class="flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-700 px-1 text-[10px]
                leading-4 text-white"
            >
              {customFieldsState.activeFilterCount}
            </span>
          </button>

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
              {customFieldsState.activeSortCount}
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

    <div class="min-h-0 grow p-3">
      {#key customFieldsState.tableKey}
        <DataTable
          {columns}
          fetchRows={customFieldsState.fetchRows}
          totalRows={customFieldsState.totalRows}
          getRowId={(field) => field.id}
          pageSize={50}
          resizable
          reorderable
          emptyLabel="No custom fields found"
          errorLabel="Could not load custom fields."
        />
      {/key}
    </div>
  </div>
</div>

<CustomFieldOverlays state={customFieldsState} />
