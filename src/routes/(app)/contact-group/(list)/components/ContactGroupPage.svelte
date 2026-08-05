<script lang="ts">
  import { Card, LinkButton, PageTitle } from "$lib";
  import { PATH_CONTACT_GROUP_ADD } from "$lib/app/paths";
  import { createContactGroupState } from "$lib/feature/contact-group/contact-group-state.svelte";
  import ContactGroupSearchInput from "./ContactGroupSearchInput.svelte";
  import FilterButton from "./filter/FilterButton.svelte";
  import SortButton from "./sort/SortButton.svelte";
  import ContactGroupTable from "./table/ContactGroupTable.svelte";
  import { createContactGroupTable } from "./table/table.svelte";

  const contactGroupState = createContactGroupState();
  const table = createContactGroupTable({ contactGroupState });
</script>

<div
  class="relative flex h-dvh min-h-0 flex-col gap-3 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle title="Contact Groups">
    <LinkButton href={PATH_CONTACT_GROUP_ADD}>Add contact group</LinkButton>
  </PageTitle>

  <Card variant="panel" class="shrink-0 space-y-3">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <ContactGroupSearchInput dataLoading={table.handlers.dataLoading} bind:value={contactGroupState.search} />

      <div class="flex items-center gap-2">
        <FilterButton filtering={table.handlers.filtering} />
        <SortButton sorting={table.handlers.sorting} />
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
