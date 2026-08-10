<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { cache, UpdateUserStore, UserFormEditQueryStore } from "$houdini";
  import { BackButton, Button, Card, Field, FieldError, FieldLabel, Input, PageTitle, Select } from "$lib";
  import { PATH_USER } from "$lib/app/paths";
  import { userRoleLabelMap, userRoleOptions } from "$lib/feature/user/user-view-data";
  import { networkErrorText } from "$lib/form/errors";
  import type { FormSubmitResult } from "$lib/form/form.svelte";
  import { notificationsState } from "$lib/state/notifications.svelte";
  import { onMount } from "svelte";
  import { createUserForm, type FormValues, type SubmitValues } from "../../../components/form/form.svelte";

  const userId = page.params.id;
  const editFormQuery = new UserFormEditQueryStore();
  const updateUserMutation = new UpdateUserStore();
  const form = createUserForm("edit", submit);
  const roleOptions = userRoleOptions.map((role) => ({ id: role, value: userRoleLabelMap[role] }));
  const selectedRole = $derived(roleOptions.find((option) => option.id === form.role.value) ?? roleOptions[0]);

  let loadError = $state<string | null>(null);
  let loading = $state(true);

  onMount(() => {
    void loadForm();
  });

  function selectRole(option: (typeof roleOptions)[number]): void {
    form.role.value = option.id;
  }

  async function loadForm(): Promise<void> {
    loading = true;
    loadError = null;
    form.clearErrors();

    try {
      if (!userId) {
        loadError = "User was not found.";
        return;
      }

      const response = await editFormQuery.fetch({ variables: { id: userId } });
      const user = response.data?.users.edges[0]?.node;

      if (response.errors || !user) {
        loadError = "There was an error.";
        return;
      }

      const values: FormValues = {
        email: user.email,
        name: user.name ?? "",
        password: "",
        role: user.role,
      };

      form.setValues(values);
    } catch {
      loadError = networkErrorText;
    } finally {
      loading = false;
    }
  }

  async function submit(input: SubmitValues): Promise<FormSubmitResult> {
    try {
      if (!userId) {
        return { error: "User was not found." };
      }

      const response = await updateUserMutation.mutate({
        input: {
          id: userId,
          name: input.name,
          role: input.role,
        },
      });

      if (response.errors) {
        return { error: "There was an error." };
      }

      cache.markStale("TenantUserConnection");
      notificationsState.showInfo("User has been updated");
      await goto(resolve(PATH_USER));
      return {};
    } catch {
      return { error: networkErrorText };
    }
  }
</script>

<div
  class="flex h-dvh min-h-0 flex-col rounded-2xl bg-linear-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle title="Edit user">
    <BackButton />
  </PageTitle>

  <div class="flex min-h-0 grow justify-center overflow-y-auto pt-4 pb-18 sm:items-start">
    <Card variant="panel" class="w-full max-w-2xl p-4 sm:p-6">
      {#if loadError}
        <div class="space-y-4 py-6 text-center">
          <FieldError error={loadError} />
          <Button variant="secondary" onclick={loadForm}>Try again</Button>
        </div>
      {:else}
        <form onsubmit={form.submit} inert={form.loading || undefined} aria-busy={loading}>
          <div class="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel for="user-name">Name</FieldLabel>
              <Input
                id="user-name"
                bind:value={form.name.value}
                {loading}
                maxlength={50}
                placeholder="Avery Johnson"
                error={form.name.error}
              />
              <FieldError error={form.name.error} />
            </Field>

            <Field>
              <Select
                value={selectedRole}
                options={roleOptions}
                label="Role"
                inputId="user-role"
                {loading}
                onChange={selectRole}
              />
            </Field>

            <Field class="sm:col-span-2">
              <FieldLabel for="user-email">Email</FieldLabel>
              <Input
                id="user-email"
                bind:value={form.email.value}
                {loading}
                maxlength={255}
                placeholder="avery@example.com"
                type="email"
                disabled
                error={form.email.error}
              />
              <FieldError error={form.email.error} />
            </Field>
          </div>

          <FieldError class="mt-3" error={form.error} />

          <div class="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onclick={() => window.history.back()}>Cancel</Button>
            <Button submit spinner={form.loading} disabled={loading || form.loading}>Update User</Button>
          </div>
        </form>
      {/if}
    </Card>
  </div>
</div>
