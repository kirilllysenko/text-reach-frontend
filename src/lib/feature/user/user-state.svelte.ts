import { DeleteUserStore, cache } from "$houdini";
import { networkErrorText } from "$lib/form/errors";
import { toGraphQLErrorText } from "$lib/graphql/errors";
import { notificationsState } from "$lib/state/notifications.svelte";
import { toUserViewModel } from "./user-display";
import { fetchAllUsers } from "./user-query";
import type { UserViewModel } from "./user-view-data";

export function createUserState() {
  const deleteUserMutation = new DeleteUserStore();
  const state = $state({
    loading: false,
    loadingError: null as string | null,
    search: "",
    loadUsers: async (): Promise<UserViewModel[]> => {
      state.loading = true;
      state.loadingError = null;

      try {
        return (await fetchAllUsers()).map(toUserViewModel);
      } catch (error) {
        state.loadingError = Array.isArray(error) ? toGraphQLErrorText(error) : networkErrorText;
        return [];
      } finally {
        state.loading = false;
      }
    },
    deleteUser: async (user: UserViewModel): Promise<boolean> => {
      try {
        const response = await deleteUserMutation.mutate({ id: user.id });

        if (response.errors || !response.data?.deleteUser) {
          notificationsState.showError(toGraphQLErrorText(response.errors));
          return false;
        }

        cache.markStale("TenantUserConnection");
        notificationsState.showInfo(`${user.name} has been deleted`);
        return true;
      } catch {
        notificationsState.showError(networkErrorText);
        return false;
      }
    },
  });

  return state;
}

export type UserState = ReturnType<typeof createUserState>;
