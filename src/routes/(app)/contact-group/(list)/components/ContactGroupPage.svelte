<script lang="ts">
  import { onDestroy } from "svelte";
  import { Button, Card, Input, PageTitle } from "$lib";
  import { PATH_CONTACT_GROUP_ADD } from "$lib/app/paths";
  import { ContactGroupState } from "$lib/feature/contact-group/contact-group-state.svelte";
  import Filter from "$lib/icons/Filter.svelte";
  import Sort from "$lib/icons/Sort.svelte";
  import ContactGroupOverlay from "./ContactGroupOverlay.svelte";
  import ContactGroupTable from "./table/ContactGroupTable.svelte";
  import { createContactGroupTable } from "./table/table.svelte";

  const contactGroupState = new ContactGroupState();
  let tableKey = contactGroupState.tableKey;
  const table = createContactGroupTable({ contactGroupState });

  $effect(() => {
    if (contactGroupState.tableKey === tableKey) {
      return;
    }

    tableKey = contactGroupState.tableKey;
    table.handlers.dataLoading.reload();
  });

  onDestroy(() => contactGroupState.dispose());
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

  <Card variant="panel" class="shrink-0 space-y-3">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Input
        class="min-w-0 grow"
        placeholder="Search contact groups"
        value={contactGroupState.search}
        oninput={(event) => contactGroupState.updateSearch(event.currentTarget.value)}
      />

      <div class="flex items-center gap-2">
        <Button
          variant="secondary"
          active={contactGroupState.filtersOpen}
          icon={Filter}
          class="relative gap-2 text-sm"
          onclick={contactGroupState.openFilters}
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
          active={contactGroupState.sortOpen}
          icon={Sort}
          class="relative gap-2 text-sm"
          onclick={contactGroupState.openSort}
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

    {#if contactGroupState.loadingError}
      <div class="text-amber-900 rounded-xl border border-amber-200/80 bg-amber-100/90 px-3 py-2 text-sm shadow-sm">
        {contactGroupState.loadingError}
      </div>
    {/if}
  </Card>

  <ContactGroupTable {table} />
</div>

<ContactGroupOverlay state={contactGroupState} filtering={table.handlers.filtering} sorting={table.handlers.sorting} />
