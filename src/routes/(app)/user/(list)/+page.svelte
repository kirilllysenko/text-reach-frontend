<script lang="ts">
  import { onMount } from "svelte";
  import { Card, LinkButton, PageTitle, Table } from "$lib";
  import { PATH_USER_ADD } from "$lib/app/paths";
  import { createFormValue } from "text-reach-frontend-library/form";
  import UserSearchInput from "./components/UserSearchInput.svelte";
  import FilterButton from "./components/filter/FilterButton.svelte";
  import SortButton from "./components/sort/SortButton.svelte";
  import { createUserTable, loadUsers } from "./components/table/table.svelte";

  const search = $state(createFormValue(""));
  let loading = $state(true);
  let error = $state<string | null>(null);
  const table = createUserTable({ onDeleted: reloadUsers });

  onMount(() => {
    void reloadUsers();
  });

  async function reloadUsers(): Promise<void> {
    loading = true;
    error = null;

    try {
      table.features.globalSearch.setFuseSearchEngine(null);
      table.replaceData(await loadUsers());
    } catch (loadError) {
      error = loadError instanceof Error ? loadError.message : "Could not load users.";
    } finally {
      loading = false;
    }
  }
</script>

<div
  class="relative flex h-dvh min-h-0 flex-col gap-3 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle title="Users">
    <LinkButton href={PATH_USER_ADD}>Add user</LinkButton>
  </PageTitle>

  <Card variant="panel" class="shrink-0 space-y-3">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <UserSearchInput search={table.handlers.globalSearch} field={search} />

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
