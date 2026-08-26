<script lang="ts">
  import { DeleteUserStore, cache } from "$houdini";
  import { resolve } from "$app/paths";
  import { Button, Dialog } from "$lib";
  import { buildUserEditPath } from "$lib/app/paths";
  import { defaultErrorText, networkErrorText } from "$lib/form/errors";
  import { getNotificationsState } from "$lib/state/notifications.svelte";
  import type { UserTableRow } from "./column.svelte";
  const notificationsState = getNotificationsState();

  interface Props {
    onDeleted: () => Promise<unknown>;
    user: UserTableRow;
  }

  let { onDeleted, user }: Props = $props();
  let confirmDelete = $state(false);
  let deleting = $state(false);
  const deleteUserMutation = new DeleteUserStore();

  async function deleteUser(): Promise<void> {
    deleting = true;

    try {
      const response = await deleteUserMutation.mutate({ id: user.id });
      if (response.errors || !response.data?.deleteUser) {
        notificationsState.showError(defaultErrorText);
        return;
      }

      cache.markStale("TenantUserConnection");
      notificationsState.showInfo(`${user.name?.trim() || "User"} has been deleted`);
      confirmDelete = false;
      await onDeleted();
    } catch {
      notificationsState.showError(networkErrorText);
    } finally {
      deleting = false;
    }
  }
</script>

<div class="flex items-center justify-end gap-1">
  <a
    href={resolve(buildUserEditPath(user.id))}
    class="hover:text-sky-800 inline-flex h-7 items-center justify-center rounded-lg border border-white/80 bg-white/80 px-2
      text-sm font-medium text-sky-700 shadow-sm hover:bg-white"
  >
    Edit
  </a>
  <button
    id={`user-delete-${user.id}`}
    class="hover:text-rose-800 inline-flex h-7 items-center justify-center rounded-lg border border-white/80 bg-white/80 px-2
      text-sm font-medium text-rose-700 shadow-sm hover:bg-white"
    type="button"
    onclick={() => (confirmDelete = true)}
  >
    Delete
  </button>
</div>

{#if confirmDelete}
  <div class="fixed inset-0 z-60 flex items-center justify-center">
    <button
      class="absolute inset-0 bg-slate-900/35 backdrop-blur-[1px]"
      type="button"
      aria-label="Cancel deleting user"
      onclick={() => (confirmDelete = false)}
    ></button>

    <div class="relative z-10">
      <Dialog>
        <h2 class="text-lg font-semibold text-slate-800">Delete user?</h2>
        <p class="mt-2 text-sm text-slate-600">
          {user.name?.trim() || "Unnamed user"} ({user.email}) will permanently lose access to this account.
        </p>

        <div class="mt-5 flex justify-end gap-2">
          <Button variant="secondary" disabled={deleting} onclick={() => (confirmDelete = false)}>Cancel</Button>
          <Button id={`user-delete-confirm-${user.id}`} spinner={deleting} onclick={deleteUser}>Delete user</Button>
        </div>
      </Dialog>
    </div>
  </div>
{/if}
