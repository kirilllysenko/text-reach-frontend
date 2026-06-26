<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import {
    Button,
    DatagridCore,
    Input,
    PageTitle,
    Table,
    accessorColumn,
    computedColumn,
    createFilterController,
    createSortController,
    type ColumnDef,
    type DataTableLoadRequest,
    type DataTableSort,
  } from "$lib";
  import ContactOverlays from "./ContactOverlays.svelte";
  import { ContactsState } from "$lib/features/contacts/contacts-state.svelte";
  import type { ContactViewModel } from "$lib/features/contacts/contacts-view-data";

  const PAGE_SIZE = 500;
  const contactsState = new ContactsState();
  const initialSorting = [
    { sortId: "lastName", direction: "ascending" },
    { sortId: "firstName", direction: "ascending" },
  ] satisfies DataTableSort[];

  let fileInput = $state<HTMLInputElement | null>(null);
  let tableKey = contactsState.tableKey;
  let rows = $state<ContactViewModel[]>([]);
  let loadingRows = $state(false);

  const filtering = createFilterController(() => void reloadRows());
  const sorting = createSortController(initialSorting, () => void reloadRows());

  function size(width: number) {
    return {
      maxWidth: width,
      minWidth: width,
      width,
    };
  }

  const columns = [
    accessorColumn<ContactViewModel, "fullName", unknown>({
      accessorKey: "fullName",
      columnId: "lastName",
      header: "Name",
      options: { sortable: true },
      state: { size: size(220) },
    }),
    accessorColumn<ContactViewModel, "phoneNumber", unknown>({
      accessorKey: "phoneNumber",
      header: "Phone",
      options: { sortable: true },
      state: { size: size(180) },
    }),
    accessorColumn<ContactViewModel, "email", unknown>({
      accessorKey: "email",
      header: "Email",
      options: { sortable: true },
      state: { size: size(240) },
    }),
    accessorColumn<ContactViewModel, "birthday", unknown>({
      accessorKey: "birthday",
      header: "Birthday",
      options: { sortable: true },
      state: { size: size(140) },
    }),
    computedColumn<ContactViewModel, unknown>({
      columnId: "groups",
      header: "Groups",
      getValueFn: (contact) =>
        contact.contactGroupIds.map((groupId) => contactsState.contactGroupNameById[groupId] ?? groupId).join(", "),
      options: { filterable: false, sortable: false },
      state: { size: size(260) },
    }),
    accessorColumn<ContactViewModel, "notes", unknown>({
      accessorKey: "notes",
      header: "Notes",
      state: { size: size(280) },
    }),
  ] satisfies ColumnDef<ContactViewModel>[];

  let table = $state<DatagridCore<ContactViewModel>>(createContactsTable([]));

  $effect(() => {
    if (contactsState.tableKey === tableKey) {
      return;
    }

    tableKey = contactsState.tableKey;
    void reloadRows();
  });

  onDestroy(() => contactsState.dispose());
  onMount(() => {
    void reloadRows();
  });

  function openImportPicker(): void {
    fileInput?.click();
  }

  function handleImportChange(event: Event): void {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    void contactsState.importContacts(file);
    input.value = "";
  }

  function createContactsTable(data: ContactViewModel[]) {
    return new DatagridCore<ContactViewModel>({
      columns,
      data,
      dataFields: [
        {
          fieldId: "lastName",
          getValueFn: (contact) => contact.lastName,
          sortable: true,
        },
        {
          fieldId: "firstName",
          getValueFn: (contact) => contact.firstName,
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
      rowIdGetter: (contact) => contact.id,
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
      const result = await contactsState.fetchRows(request);
      rows = result.rows;
      table = createContactsTable(rows);
    } finally {
      loadingRows = false;
    }
  }
</script>

{#snippet contactsEmpty()}
  No contacts found
{/snippet}

{#snippet contactsLoadingError()}
  Could not load contacts.
{/snippet}

<div
  class="relative flex h-full min-h-dvh flex-col rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:min-h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle title="Contacts">
    <div class="flex items-center gap-2">
      <input bind:this={fileInput} class="hidden" type="file" accept=".csv,text/csv" onchange={handleImportChange} />

      <Button secondary small disabled={contactsState.importing} onclick={openImportPicker}>
        <svg class="size-4 fill-slate-700" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M11 16h2V7l3.5 3.5 1.4-1.4L12 3.2 6.1 9.1l1.4 1.4L11 7v9z" />
          <path d="M5 18h14v2H5v-2z" />
        </svg>
        <span class="hidden sm:inline">{contactsState.importing ? "Importing" : "Import"}</span>
      </Button>

      <Button secondary small disabled={contactsState.exporting} onclick={contactsState.exportContacts}>
        <svg class="size-4 fill-slate-700" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M11 4h2v9l3.5-3.5 1.4 1.4L12 16.8l-5.9-5.9 1.4-1.4L11 13V4z" />
          <path d="M5 18h14v2H5v-2z" />
        </svg>
        <span class="hidden sm:inline">{contactsState.exporting ? "Exporting" : "Export"}</span>
      </Button>
    </div>
  </PageTitle>

  <div
    class="flex min-h-0 grow flex-col overflow-hidden rounded-2xl border border-white/70 bg-white/70
      shadow-[0_20px_45px_-25px_rgba(30,41,59,0.45)] backdrop-blur-md"
  >
    <div class="shrink-0 space-y-3 border-b border-white/70 bg-white/55 p-3 backdrop-blur-sm">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          class="min-w-0 grow"
          placeholder="Search contacts"
          value={contactsState.search}
          oninput={(event) => contactsState.updateSearch(event.currentTarget.value)}
        />

        <div class="flex items-center gap-2">
          <button
            class={[
              `relative flex h-9 items-center gap-2 rounded-xl border bg-white/90 px-3 text-sm font-medium
                text-slate-700 shadow-sm hover:cursor-pointer hover:bg-white`,
              contactsState.filtersOpen ? "border-sky-300 bg-sky-50/90" : "border-white/80",
            ]}
            type="button"
            onclick={contactsState.openFilters}
          >
            <svg
              viewBox="0 0 24 24"
              class={["size-5", contactsState.filtersOpen ? "fill-sky-700" : "fill-slate-700"]}
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
              contactsState.sortOpen ? "border-sky-300 bg-sky-50/90" : "border-white/80",
            ]}
            type="button"
            onclick={contactsState.openSort}
          >
            <svg
              viewBox="0 0 24 24"
              class={["size-5", contactsState.sortOpen ? "fill-sky-700" : "fill-slate-700"]}
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

      {#if contactsState.loadingError || contactsState.actionMessage}
        <div
          class={[
            `rounded-xl border px-3 py-2 text-sm shadow-sm`,
            contactsState.loadingError
              ? "text-amber-900 border-amber-200/80 bg-amber-100/90"
              : "bg-emerald-50 text-emerald-900 border-emerald-200/80",
          ]}
        >
          {contactsState.loadingError ?? contactsState.actionMessage}
        </div>
      {/if}
    </div>

    <div class="min-h-0 grow p-3">
      {#key table}
        <Table {table} loading={loadingRows} />
      {/key}
    </div>
  </div>
</div>

<ContactOverlays state={contactsState} {filtering} {sorting} />
