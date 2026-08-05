<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { BackButton, Button, Field, FieldError, FieldLabel, Input, PageTitle } from "$lib";
  import { PATH_USER } from "$lib/app/paths";
  import PasswordInput from "$lib/components/password-input/PasswordInput.svelte";
  import { networkErrorText } from "$lib/form/errors";
  import { fetchUserById } from "$lib/feature/user/user-query";
  import { userRoleLabelMap, userRoleOptions } from "$lib/feature/user/user-view-data";
  import { createUserForm, type FormMode } from "./form.svelte";

  interface Props {
    id?: string;
    mode: FormMode;
  }

  let { id, mode }: Props = $props();

  const initialProps = untrack(() => ({ id, mode }));
  const { form, serializeEditableValues, setUser } = createUserForm(initialProps);

  let initialPayload = $state("");
  let loadingUser = $state(initialProps.mode === "edit");

  const title = initialProps.mode === "create" ? "Add user" : "Edit user";
  const submitLabel = initialProps.mode === "create" ? "Create" : "Save";
  const formDirty = $derived(serializeEditableValues() !== initialPayload);
  const submitDisabled = $derived(form.loading || loadingUser || (initialProps.mode === "edit" && !formDirty));

  onMount(() => {
    if (initialProps.mode === "edit") {
      void loadUser();
    }
  });

  async function loadUser(): Promise<void> {
    if (!initialProps.id) {
      form.error = "User was not found.";
      loadingUser = false;
      return;
    }

    try {
      const user = await fetchUserById(initialProps.id);
      if (!user) {
        form.error = "User was not found.";
        return;
      }

      setUser(user);
      initialPayload = serializeEditableValues();
    } catch {
      form.error = networkErrorText;
    } finally {
      loadingUser = false;
    }
  }
</script>

<div
  class="flex h-dvh min-h-0 flex-col rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle {title}>
    <BackButton href={PATH_USER} />
  </PageTitle>

  <div class="flex min-h-0 grow justify-center overflow-y-auto pt-4 pb-18 sm:items-start">
    <section
      class="w-full max-w-2xl rounded-2xl border border-white/80 bg-white/75 p-4
        shadow-[0_20px_45px_-25px_rgba(30,41,59,0.45)] backdrop-blur-md sm:p-6"
    >
      <form onsubmit={form.submit} inert={form.loading || loadingUser || undefined}>
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
            <FieldLabel for="user-role">Role</FieldLabel>
            <select
              id="user-role"
              bind:value={form.role.value}
              class="h-10 w-full rounded-[1.05rem] border-none bg-white/70 px-3 text-slate-700
                shadow-[inset_0px_0px_7px_3px_rgba(30,41,59,0.1)] focus:ring-2 focus:ring-sky-500/25
                focus:outline-none"
            >
              {#each userRoleOptions as role (role)}
                <option value={role}>{userRoleLabelMap[role]}</option>
              {/each}
            </select>
          </Field>

          <Field class="sm:col-span-2">
            <FieldLabel for="user-email">Email</FieldLabel>
            <Input
              id="user-email"
              bind:value={form.email.value}
              maxlength={255}
              placeholder="avery@example.com"
              type="email"
              disabled={initialProps.mode === "edit"}
              error={form.email.error}
            />
            <FieldError error={form.email.error} />
          </Field>

          {#if initialProps.mode === "create"}
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
          <a
            href={PATH_USER}
            class="flex h-9 items-center justify-center rounded-xl border border-white/80 bg-white/80 px-3
              text-base font-medium text-slate-700 shadow-sm backdrop-blur-sm hover:bg-white"
          >
            Cancel
          </a>
          <Button submit spinner={form.loading} disabled={submitDisabled}>{submitLabel}</Button>
        </div>
      </form>
    </section>
  </div>
</div>
