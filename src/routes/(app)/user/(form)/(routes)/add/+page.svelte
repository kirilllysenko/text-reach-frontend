<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { cache, CreateUserStore } from "$houdini";
  import { BackButton, Button, Card, Field, FieldError, FieldLabel, Input, PageTitle, Select } from "$lib";
  import { PATH_USER } from "$lib/app/paths";
  import PasswordInput from "$lib/components/password-input/PasswordInput.svelte";
  import { userRoleLabelMap, userRoleOptions } from "$lib/feature/user/user-view-data";
  import { networkErrorText } from "$lib/form/errors";
  import type { FormSubmitResult } from "$lib/form/form.svelte";
  import { notificationsState } from "$lib/state/notifications.svelte";
  import { createUserForm, type SubmitValues } from "../../components/form/form.svelte";

  const createUserMutation = new CreateUserStore();
  const form = createUserForm("create", submit);
  const roleOptions = userRoleOptions.map((role) => ({ id: role, value: userRoleLabelMap[role] }));
  const selectedRole = $derived(roleOptions.find((option) => option.id === form.role.value) ?? roleOptions[0]);

  function selectRole(option: (typeof roleOptions)[number]): void {
    form.role.value = option.id;
  }

  async function submit(input: SubmitValues): Promise<FormSubmitResult> {
    try {
      const response = await createUserMutation.mutate({ input });
      if (response.errors) {
        return { error: "There was an error." };
      }

      cache.markStale("TenantUserConnection");
      notificationsState.showInfo("User has been created");
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
  <PageTitle title="Add user">
    <BackButton />
  </PageTitle>

  <div class="flex min-h-0 grow justify-center overflow-y-auto pt-4 pb-18 sm:items-start">
    <Card variant="panel" class="w-full max-w-2xl p-4 sm:p-6">
      <form onsubmit={form.submit} inert={form.loading || undefined}>
        <div class="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel for="user-name">Name</FieldLabel>
            <Input
              id="user-name"
              bind:value={form.name.value}
              maxlength={50}
              placeholder="Avery Johnson"
              error={form.name.error}
            />
            <FieldError error={form.name.error} />
          </Field>

          <Field>
            <Select value={selectedRole} options={roleOptions} label="Role" inputId="user-role" onChange={selectRole} />
          </Field>

          <Field class="sm:col-span-2">
            <FieldLabel for="user-email">Email</FieldLabel>
            <Input
              id="user-email"
              bind:value={form.email.value}
              maxlength={255}
              placeholder="avery@example.com"
              type="email"
              error={form.email.error}
            />
            <FieldError error={form.email.error} />
          </Field>

          <Field class="sm:col-span-2">
            <FieldLabel for="user-password">Temporary password</FieldLabel>
            <PasswordInput
              id="user-password"
              bind:value={form.password.value}
              maxlength={50}
              autocomplete="new-password"
              placeholder="At least 8 characters"
              error={form.password.error}
            />
            <FieldError error={form.password.error} />
            <p class="mt-1 text-xs text-slate-500">Use 8–50 characters with uppercase, lowercase, and a number.</p>
          </Field>
        </div>

        <FieldError class="mt-3" error={form.error} />

        <div class="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onclick={() => window.history.back()}>Cancel</Button>
          <Button submit spinner={form.loading} disabled={form.loading}>Add User</Button>
        </div>
      </form>
    </Card>
  </div>
</div>
