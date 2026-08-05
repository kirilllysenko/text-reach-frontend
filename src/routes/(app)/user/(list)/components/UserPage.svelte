<script lang="ts">
  import { onMount } from "svelte";
  import { Card, LinkButton, PageTitle } from "$lib";
  import { PATH_USER_ADD } from "$lib/app/paths";
  import { createUserState } from "$lib/feature/user/user-state.svelte";
  import type { UserViewModel } from "$lib/feature/user/user-view-data";
  import UserSearchInput from "./UserSearchInput.svelte";
  import FilterButton from "./filter/FilterButton.svelte";
  import SortButton from "./sort/SortButton.svelte";
  import UserTable from "./table/UserTable.svelte";
  import { createUserTable } from "./table/table.svelte";

  const userState = createUserState();
  const table = createUserTable({ onDelete: deleteUser });

  onMount(() => {
    void reloadUsers();
  });

  async function reloadUsers(): Promise<void> {
    const users = await userState.loadUsers();
    table.features.globalSearch.setFuseSearchEngine(null);
    table.replaceData(users);
  }

  async function deleteUser(user: UserViewModel): Promise<boolean> {
    if (!(await userState.deleteUser(user))) {
      return false;
    }

    await reloadUsers();
    return true;
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
      <UserSearchInput search={table.handlers.globalSearch} bind:value={userState.search} />

      <div class="flex items-center gap-2">
        <FilterButton filtering={table.handlers.filtering} />
        <SortButton sorting={table.handlers.sorting} />
      </div>
    </div>
  </Card>

  <UserTable {table} loading={userState.loading} error={userState.loadingError} />
</div>
