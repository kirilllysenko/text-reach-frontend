<script lang="ts">
  import { Button, Field, FieldError, FieldLabel, Input, Select } from "$lib";
  import PasswordInput from "$lib/components/password-input/PasswordInput.svelte";
  import { userRoleLabelMap, userRoleOptions } from "$lib/feature/user/user-view-data";
  import { createUserForm, type FormMode } from "./form/form.svelte";

  interface Props {
    form: ReturnType<typeof createUserForm>;
    loading?: boolean;
    mode: FormMode;
    submitLabel: string;
  }

  let { form, loading = false, mode, submitLabel }: Props = $props();

  const roleOptions = userRoleOptions.map((role) => ({ id: role, value: userRoleLabelMap[role] }));
  const selectedRole = $derived(roleOptions.find((option) => option.id === form.role.value) ?? roleOptions[0]);

  function selectRole(option: (typeof roleOptions)[number]): void {
    form.role.value = option.id;
  }
</script>

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
        disabled={mode === "edit"}
        error={form.email.error}
      />
      <FieldError error={form.email.error} />
    </Field>

    {#if mode === "create"}
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
    {/if}
  </div>

  <FieldError class="mt-3" error={form.error} />

  <div class="mt-5 flex justify-end gap-2">
    <Button variant="secondary" onclick={() => window.history.back()}>Cancel</Button>
    <Button submit spinner={form.loading} disabled={loading || form.loading}>{submitLabel}</Button>
  </div>
</form>
