<script lang="ts">
  import { onDestroy } from "svelte";
  import { page } from "$app/state";
  import { BackButton, Button, Card, Input, PageTitle } from "$lib";
  import { PATH_CAMPAIGN } from "$lib/app/paths";
  import { CampaignMessagesState } from "$lib/feature/message/message-state.svelte";
  import Filter from "$lib/icons/Filter.svelte";
  import Sort from "$lib/icons/Sort.svelte";
  import MessageOverlay from "./components/MessageOverlay.svelte";
  import MessageTable from "./components/MessageTable.svelte";
  import { createMessageTable } from "./components/table/table.svelte";

  const state = new CampaignMessagesState(page.params.id ?? "");
  const table = createMessageTable(state);
  let tableKey = state.tableKey;

  $effect(() => {
    if (state.tableKey === tableKey) {
      return;
    }

    tableKey = state.tableKey;
    void table.features.dataLoading.reload("search");
  });

  onDestroy(() => state.dispose());
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
      <Input
        class="min-w-0 grow"
        placeholder="Search message text or tenant phone"
        value={state.search}
        oninput={(event) => state.updateSearch(event.currentTarget.value)}
      />

      <div class="flex items-center gap-2">
        <Button
          variant="secondary"
          active={state.filtersOpen}
          icon={Filter}
          class="relative gap-2 text-sm"
          onclick={state.openFilters}
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
          active={state.sortOpen}
          icon={Sort}
          class="relative gap-2 text-sm"
          onclick={state.openSort}
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

    {#if state.loadingError}
      <div class="text-amber-900 rounded-xl border border-amber-200/80 bg-amber-100/90 px-3 py-2 text-sm shadow-sm">
        {state.loadingError}
      </div>
    {/if}
  </Card>

  <MessageTable {table} />
</div>

<MessageOverlay {state} filtering={table.handlers.filtering} sorting={table.handlers.sorting} />
