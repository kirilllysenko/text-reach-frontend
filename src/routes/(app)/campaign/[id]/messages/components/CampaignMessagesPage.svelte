<script lang="ts">
  import { page } from "$app/state";
  import { BackButton, Card, PageTitle } from "$lib";
  import { PATH_CAMPAIGN } from "$lib/app/paths";
  import { CampaignMessagesState } from "$lib/feature/message/message-state.svelte";
  import FilterButton from "./filter/FilterButton.svelte";
  import MessageSearchInput from "./MessageSearchInput.svelte";
  import MessageTable from "./MessageTable.svelte";
  import SortButton from "./sort/SortButton.svelte";
  import { createMessageTable } from "./table/table.svelte";

  const state = new CampaignMessagesState(page.params.id ?? "");
  const table = createMessageTable(state);
</script>

<div
  class="relative flex h-dvh min-h-0 flex-col gap-3 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle title="Campaign messages">
    <BackButton href={PATH_CAMPAIGN} />
  </PageTitle>

  <Card variant="panel" class="shrink-0 space-y-3">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <MessageSearchInput dataLoading={table.handlers.dataLoading} bind:value={state.search} />

      <div class="flex items-center gap-2">
        <FilterButton filtering={table.handlers.filtering} />
        <SortButton sorting={table.handlers.sorting} />
      </div>
    </div>

    {#if state.loadingError}
      <div class="text-amber-900 rounded-xl border border-amber-200/80 bg-amber-100/90 px-3 py-2 text-sm shadow-sm">
        {state.loadingError}
      </div>
    {/if}
  </Card>

  <MessageTable {table} />
</div>
