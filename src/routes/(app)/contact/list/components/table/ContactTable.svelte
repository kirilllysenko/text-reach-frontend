<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import {
    DatagridCore,
    Table,
    accessorColumn,
    computedColumn,
    displayColumn,
    type ColumnDef,
    type DataTableLoadRequest,
  } from "$lib";
  import type { ContactViewModel } from "$lib/feature/contact/contact-view-data";
  import type { ContactGroupLookupState } from "../contact-group-lookup-state.svelte";
  import ContactActionCell from "./ContactTableActionCell.svelte";
  import { ContactTableState } from "./table.svelte";

  interface Props {
    groups: ContactGroupLookupState;
    tableState: ContactTableState;
  }

  const PAGE_SIZE = 500;

  let { groups, tableState }: Props = $props();
  let tableKey = $state(0);
  let rows = $state<ContactViewModel[]>([]);
  let loadingRows = $state(false);

  function size(width: number) {
    return {
      maxWidth: Math.max(width * 3, 640),
      minWidth: Math.min(width, 96),
      width,
    };
  }

  const columns = [
    accessorColumn<ContactViewModel, "fullName", unknown>({
      accessorKey: "fullName",
      columnId: "lastName",
      header: "Name",
      options: { filterable: false, sortable: false },
      state: { size: size(220) },
    }),
    accessorColumn<ContactViewModel, "phoneNumber", unknown>({
      accessorKey: "phoneNumber",
      header: "Phone",
      options: { filterable: false, sortable: false },
      state: { size: size(180) },
    }),
    accessorColumn<ContactViewModel, "email", unknown>({
      accessorKey: "email",
      header: "Email",
      options: { filterable: false, sortable: false },
      state: { size: size(240) },
    }),
    accessorColumn<ContactViewModel, "birthday", unknown>({
      accessorKey: "birthday",
      header: "Birthday",
      options: { filterable: false, sortable: false },
      state: { size: size(140) },
    }),
    computedColumn<ContactViewModel, unknown>({
      columnId: "groups",
      header: "Groups",
      getValueFn: (contact) =>
        contact.contactGroupIds.map((groupId) => groups.contactGroupNameById[groupId] ?? groupId).join(", "),
      options: { filterable: false, sortable: false },
      state: { size: size(260) },
    }),
    accessorColumn<ContactViewModel, "notes", unknown>({
      accessorKey: "notes",
      header: "Notes",
      options: { filterable: false, sortable: false },
      state: { size: size(280) },
    }),
    displayColumn<ContactViewModel, unknown>({
      columnId: "actions",
      header: "",
      cell: ({ row }) => ({
        component: ContactActionCell,
        props: { contact: row.original },
      }),
      options: {
        hideable: false,
        moveable: false,
        pinnable: false,
        resizable: false,
      },
      state: { size: size(88) },
    }),
  ] satisfies ColumnDef<ContactViewModel>[];

  let table = $state<DatagridCore<ContactViewModel>>(createContactTable([]));

  $effect(() => {
    if (tableState.tableKey === tableKey) {
      return;
    }

    tableKey = tableState.tableKey;
    void reloadRows();
  });

  onDestroy(() => tableState.dispose());
  onMount(() => {
    void reloadRows();
  });

  function createContactTable(data: ContactViewModel[]) {
    return new DatagridCore<ContactViewModel>({
      columns,
      data,
      initialState: {
        pagination: { pageSize: PAGE_SIZE },
      },
      rowIdGetter: (contact) => contact.id,
    });
  }

  async function reloadRows(): Promise<void> {
    loadingRows = true;

    const request = {
      cursor: null,
      filters: [],
      limit: PAGE_SIZE,
      sorting: [],
    } satisfies DataTableLoadRequest;

    try {
      const result = await tableState.fetchRows(request);
      rows = result.rows;
      table = createContactTable(rows);
    } finally {
      loadingRows = false;
    }
  }
</script>

<div
  class="flex min-h-0 grow flex-col overflow-hidden rounded-2xl border border-white/70 bg-white/70 p-0
    shadow-[0_20px_45px_-25px_rgba(30,41,59,0.45)] backdrop-blur-md"
>
  {#key table}
    <Table {table} loading={loadingRows} />
  {/key}
</div>
