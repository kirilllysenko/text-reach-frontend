<script lang="ts">
  import { onMount } from "svelte";
  import { Card, LinkButton, PageTitle, Table } from "$lib";
  import { PATH_CUSTOM_FIELD_ADD } from "$lib/app/paths";
  import CustomFieldSearchInput from "./components/CustomFieldSearchInput.svelte";
  import FilterButton from "./components/filter/FilterButton.svelte";
  import SortButton from "./components/sort/SortButton.svelte";
  import { createCustomFieldTable, loadCustomFields } from "./components/table/table.svelte";

  let search = $state("");
  let loading = $state(true);
  let error = $state<string | null>(null);
  const table = createCustomFieldTable();

  onMount(() => {
    void reloadCustomFields();
  });

  async function reloadCustomFields(): Promise<void> {
    loading = true;
    error = null;

    try {
      table.replaceData(await loadCustomFields());
    } catch (loadError) {
      error = loadError instanceof Error ? loadError.message : "Could not load custom fields.";
    } finally {
      loading = false;
    }
  }
</script>

<div
  class="relative flex h-dvh min-h-0 flex-col gap-3 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle title="Custom Fields">
    <LinkButton href={PATH_CUSTOM_FIELD_ADD}>Add custom field</LinkButton>
  </PageTitle>

  <Card variant="panel" class="shrink-0 space-y-3">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <CustomFieldSearchInput search={table.handlers.globalSearch} bind:value={search} />

      <div class="flex items-center gap-2">
        <FilterButton filtering={table.handlers.filtering} />
        <SortButton sorting={table.handlers.sorting} />
      </div>
    </div>
  </Card>

  <Card variant="table">
    <Table {table} {loading} {error} />
  </Card>
</div>
