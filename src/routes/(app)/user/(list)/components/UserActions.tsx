import { createSignal, Show } from "solid-js";
import { DeleteUserDocument, type UsersQuery } from "~/gql/graphql";
import { buildUserEditPath } from "~/lib/app/paths";
import { Button } from "~/components";
import { defaultErrorText, networkErrorText } from "~/lib/form/errors";
import { graphqlClient } from "~/lib/graphql/client";
import { showError, showInfo } from "~/lib/state/notifications";

type UserRow = UsersQuery["users"]["edges"][number]["node"];

export function UserActions(props: { user: UserRow; onDeleted: () => Promise<void> }) {
  const [confirmDelete, setConfirmDelete] = createSignal(false);
  const [deleting, setDeleting] = createSignal(false);

  async function deleteUser(): Promise<void> {
    setDeleting(true);
    try {
      const response = await graphqlClient.mutation(DeleteUserDocument, { id: props.user.id });
      if (response.error || !response.data?.deleteUser) {
        showError(defaultErrorText);
        return;
      }
      showInfo(`${props.user.name?.trim() || "User"} has been deleted`);
      setConfirmDelete(false);
      await props.onDeleted();
    } catch {
      showError(networkErrorText);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div class="flex items-center justify-end gap-1">
        <a
          href={buildUserEditPath(props.user.id)}
          class="hover:text-sky-800 inline-flex h-7 items-center justify-center rounded-lg border border-white/80 bg-white/80 px-2 text-sm text-sky-700 shadow-sm hover:bg-white"
        >
          Edit
        </a>
        <button
          class="hover:text-rose-800 inline-flex h-7 items-center justify-center rounded-lg border border-white/80 bg-white/80 px-2 text-sm font-medium text-rose-700 shadow-sm hover:bg-white"
          type="button"
          onClick={() => setConfirmDelete(true)}
        >
          Delete
        </button>
      </div>
      <Show when={confirmDelete()}>
        <div class="fixed inset-0 z-60 flex items-center justify-center">
          <button
            class="absolute inset-0 bg-slate-900/35 backdrop-blur-[1px]"
            type="button"
            aria-label="Cancel deleting user"
            onClick={() => setConfirmDelete(false)}
          />
          <div class="relative z-10 mx-3 max-w-lg rounded-2xl border border-white/80 bg-white/95 p-5 shadow-xl">
            <h2 class="text-lg font-semibold text-slate-800">Delete user?</h2>
            <p class="mt-2 text-sm text-slate-600">
              {props.user.name?.trim() || "Unnamed user"} ({props.user.email}) will permanently lose access to this
              account.
            </p>
            <div class="mt-5 flex justify-end gap-2">
              <Button variant="secondary" disabled={deleting()} onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
              <Button spinner={deleting()} onClick={() => void deleteUser()}>
                Delete user
              </Button>
            </div>
          </div>
        </div>
      </Show>
    </>
  );
}
