<script lang="ts">
  import { Input, LinkButton, PageTitle, createFilterController, createSortController, type DataTableSort } from "$lib";
  import Alert from "$lib/components/alert/Alert.svelte";
  import { PATH_CONTACT_ADD } from "$lib/app/paths";
  import { contactSortFieldOptions } from "$lib/feature/contact/contact-view-data";
  import Filter from "$lib/icons/Filter.svelte";
  import Sort from "$lib/icons/Sort.svelte";
  import ContactOverlay from "./components/ContactOverlay.svelte";
  import { ContactGroupLookupState } from "./components/contact-group-lookup-state.svelte";
  import ContactExportButton from "./components/export/ContactExportButton.svelte";
  import { ContactExportState } from "./components/export/contact-export-state.svelte";
  import ContactImportButton from "./components/import/ContactImportButton.svelte";
  import { ContactImportState } from "./components/import/contact-import-state.svelte";
  import ContactTable from "./components/table/ContactTable.svelte";
  import { ContactTableState } from "./components/table/table.svelte";

  const groups = new ContactGroupLookupState();
  const tableState = new ContactTableState();
  const contactExport = new ContactExportState({ groups });
  const contactImport = new ContactImportState({ refreshTable: tableState.refresh });
  const initialSorting = [
    { sortId: "lastName", direction: "ascending" },
    { sortId: "firstName", direction: "ascending" },
  ] satisfies DataTableSort[];
  type OpenPanel = "filters" | "sort" | null;

  let openPanel = $state<OpenPanel>(null);

  const filtering = createFilterController(() => {});
  const sorting = createSortController(initialSorting, () => {});
  const contactActionMessage = $derived(
    tableState.loadingError ?? contactImport.actionMessage ?? contactExport.actionMessage,
  );
  const contactActionAlertType = $derived(tableState.loadingError ? "warning" : "success");

  function togglePanel(panel: Exclude<OpenPanel, null>): void {
    openPanel = openPanel === panel ? null : panel;
  }

  function closeOverlays(): void {
    openPanel = null;
  }
</script>

{#snippet contactsEmpty()}
  No contacts found
{/snippet}

{#snippet contactsLoadingError()}
  Could not load contacts.
{/snippet}

<div
  class="relative flex h-dvh min-h-0 flex-col gap-3 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle title="Contacts">
    <div class="flex items-center gap-2">
      <LinkButton href={PATH_CONTACT_ADD}>Add contact</LinkButton>

      <ContactImportButton {contactImport} />

      <ContactExportButton
        {contactExport}
        snapshot={{
          filters: filtering.filters,
          search: tableState.search,
          sorting: sorting.sorts,
        }}
      />
    </div>
  </PageTitle>

  <div
    class="shrink-0 space-y-3 rounded-2xl border border-white/70 bg-white/70 p-3
      shadow-[0_20px_45px_-25px_rgba(30,41,59,0.45)] backdrop-blur-md"
  >
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Input
        class="min-w-0 grow"
        placeholder="Search contacts"
        value={tableState.search}
        oninput={(event) => tableState.updateSearch(event.currentTarget.value)}
      />

      <div class="flex items-center gap-2">
        <button
          class={[
            `relative flex h-9 items-center gap-2 rounded-xl border bg-white/90 px-3 text-sm font-medium
              text-slate-700 shadow-sm hover:cursor-pointer hover:bg-white`,
            openPanel === "filters" ? "border-sky-300 bg-sky-50/90" : "border-white/80",
          ]}
          type="button"
          onclick={() => togglePanel("filters")}
        >
          <Filter class={["size-5", openPanel === "filters" ? "fill-sky-700" : "fill-slate-700"]} />
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
            openPanel === "sort" ? "border-sky-300 bg-sky-50/90" : "border-white/80",
          ]}
          type="button"
          onclick={() => togglePanel("sort")}
        >
          <Sort class={["size-5", openPanel === "sort" ? "fill-sky-700" : "fill-slate-700"]} />
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

    {#if contactActionMessage}
      <Alert layout="inline" type={contactActionAlertType}>
        {contactActionMessage}
      </Alert>
    {/if}
  </div>

  <ContactTable {groups} {tableState} />
</div>

<ContactOverlay
  {filtering}
  {sorting}
  {openPanel}
  onClose={closeOverlays}
  groupOptions={groups.groupOptions}
  sortFieldOptions={contactSortFieldOptions}
/>
