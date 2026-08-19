<script lang="ts">
  import { DeleteContactsStore } from "$houdini";
  import type { ContactFilterInput } from "$houdini/graphql/inputs";
  import { Button, Dialog } from "$lib";
  import { notificationsState } from "text-reach-frontend-library/state/notifications.svelte";

  interface Props {
    filter: ContactFilterInput | null;
    onDeleted: () => Promise<unknown>;
    selectedCount: number;
  }

  let { filter, onDeleted, selectedCount }: Props = $props();
  let confirmDelete = $state(false);
  let deleting = $state(false);
  const deleteContactsMutation = new DeleteContactsStore();

  async function deleteContacts(): Promise<void> {
    if (!filter || deleting) {
      return;
    }

    deleting = true;

    try {
      const response = await deleteContactsMutation.mutate({ filter });
      if (response.errors || !response.data?.deleteContacts) {
        notificationsState.showError("There was an error.");
        return;
      }

      notificationsState.showInfo(
        selectedCount === 1 ? "Contact has been deleted." : `${selectedCount} contacts have been deleted.`,
      );
      confirmDelete = false;
      await onDeleted();
    } catch {
      notificationsState.showError("There was an error.");
    } finally {
      deleting = false;
    }
  }
</script>

<Button variant="secondary" disabled={!filter || selectedCount === 0} onclick={() => (confirmDelete = true)}>
  {selectedCount > 0 ? `Delete selected (${selectedCount})` : "Delete selected"}
</Button>

{#if confirmDelete}
  <div class="fixed inset-0 z-60 flex items-center justify-center">
    <button
      class="absolute inset-0 bg-slate-900/35 backdrop-blur-[1px]"
      type="button"
      aria-label="Cancel deleting contacts"
      disabled={deleting}
      onclick={() => (confirmDelete = false)}
    ></button>

    <div class="relative z-10">
      <Dialog>
        <h2 class="text-lg font-semibold text-slate-800">Delete selected contacts?</h2>
        <p class="mt-2 text-sm text-slate-600">
          {selectedCount === 1
            ? "The selected contact will be permanently deleted."
            : `${selectedCount} selected contacts will be permanently deleted.`}
        </p>

        <div class="mt-5 flex justify-end gap-2">
          <Button variant="secondary" disabled={deleting} onclick={() => (confirmDelete = false)}>Cancel</Button>
          <Button spinner={deleting} onclick={deleteContacts}>
            {selectedCount === 1 ? "Delete contact" : "Delete contacts"}
          </Button>
        </div>
      </Dialog>
    </div>
  </div>
{/if}
