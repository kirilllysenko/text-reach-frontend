<script lang="ts">
  import { onDestroy } from "svelte";
  import {
    Button,
    Input,
    PageTitle,
    Table,
    accessorColumn,
    columnsFeature,
    createDataTable,
    displayColumn,
    filtersFeature,
    infiniteLoaderFeature,
    sortingFeature,
    virtualWindowFeature,
    type DataTable,
    type DataTableColumnDef,
  } from "$lib";
  import ContactOverlays from "./ContactOverlays.svelte";
  import { ContactsState } from "$lib/features/contacts/contacts-state.svelte";
  import type { ContactViewModel } from "$lib/features/contacts/contacts-view-data";

  const contactsState = new ContactsState();

  let fileInput = $state<HTMLInputElement | null>(null);
  let tableKey = contactsState.tableKey;

  const columns = [
    accessorColumn({
      accessorKey: "fullName",
      id: "lastName",
      header: "Name",
      sortable: true,
      size: 220,
    }),
    accessorColumn({
      accessorKey: "phoneNumber",
      header: "Phone",
      sortable: true,
      size: 180,
    }),
    accessorColumn({
      accessorKey: "email",
      header: "Email",
      sortable: true,
      size: 240,
    }),
    accessorColumn({
      accessorKey: "birthday",
      header: "Birthday",
      sortable: true,
      size: 140,
    }),
    displayColumn({
      id: "groups",
      header: "Groups",
      format: (_, contact: ContactViewModel) =>
        contact.contactGroupIds.map((groupId) => contactsState.contactGroupNameById[groupId] ?? groupId).join(", "),
      size: 260,
    }),
    accessorColumn({
      accessorKey: "notes",
      header: "Notes",
      size: 280,
    }),
  ] satisfies DataTableColumnDef<ContactViewModel>[];

  let table = $state<DataTable<ContactViewModel>>(createContactsTable());

  $effect(() => {
    if (contactsState.tableKey === tableKey) {
      return;
    }

    tableKey = contactsState.tableKey;
    table = createContactsTable();
  });

  onDestroy(() => contactsState.dispose());

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

  function createContactsTable() {
    return createDataTable<ContactViewModel>({
      emptyLabel: "No contacts found",
      errorLabel: "Could not load contacts.",
      getRowId: (contact) => contact.id,
      features: [
        columnsFeature({ columns }),
        sortingFeature({
          sorts: [
            { sortId: "lastName", direction: "ascending" },
            { sortId: "firstName", direction: "ascending" },
          ],
        }),
        filtersFeature({ filters: [] }),
        infiniteLoaderFeature({
          loadRows: contactsState.fetchRows,
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
              {table.filters.value.length}
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
              {table.sorting.sorts.length}
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
        <Table {table} />
      {/key}
    </div>
  </div>
</div>

<ContactOverlays state={contactsState} {table} />
