<script lang="ts">
  import { Button, Dialog } from "$lib";
  import { buildUserEditPath } from "$lib/app/paths";
  import type { UserViewModel } from "$lib/feature/user/user-view-data";

  interface Props {
    onDelete: (user: UserViewModel) => Promise<boolean>;
    user: UserViewModel;
  }

  let { onDelete, user }: Props = $props();
  let confirmDelete = $state(false);
  let deleting = $state(false);

  async function deleteUser(): Promise<void> {
    deleting = true;
    const deleted = await onDelete(user);
    deleting = false;

    if (deleted) {
      confirmDelete = false;
    }
  }
</script>

<div class="flex items-center justify-end gap-1">
  <a
    href={buildUserEditPath(user.id)}
    class="hover:text-sky-800 inline-flex h-7 items-center justify-center rounded-lg border border-white/80 bg-white/80 px-2
      text-sm font-medium text-sky-700 shadow-sm hover:bg-white"
  >
    Edit
  </a>
  <button
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
          {user.name} ({user.email}) will permanently lose access to this account.
        </p>

        <div class="mt-5 flex justify-end gap-2">
          <Button variant="secondary" disabled={deleting} onclick={() => (confirmDelete = false)}>Cancel</Button>
          <Button spinner={deleting} onclick={deleteUser}>Delete user</Button>
        </div>
      </Dialog>
    </div>
  </div>
{/if}
