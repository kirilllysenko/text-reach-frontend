<script lang="ts">
  import { Button, ButtonEye, Field, FieldError, FieldLabel, Input } from "$lib";
  import PageTitle from "$lib/components/page-title/PageTitle.svelte";
  import { changeName, changePassword } from "$lib/api/profile/profile";
  import type { ErrorResponseDto } from "$lib/api/index.schemas";
  import { PasswordSchema } from "$lib/form/validators";
  import { notificationsState } from "$lib/state/notifications.svelte";
  import { sessionState } from "$lib/state/session.svelte";

  let name = $state("");
  let initialName = $state("");
  let initialized = $state(false);

  let savingName = $state(false);
  let savingPassword = $state(false);

  let nameError = $state<string | null>(null);
  let nameFormError = $state<string | null>(null);

  let oldPassword = $state("");
  let newPassword = $state("");
  let oldPasswordError = $state<string | null>(null);
  let newPasswordError = $state<string | null>(null);
  let passwordFormError = $state<string | null>(null);
  let maskOldPassword = $state(true);
  let maskNewPassword = $state(true);

  $effect(() => {
    if (initialized || !sessionState.profile) {
      return;
    }

    name = sessionState.profile.name ?? "";
    initialName = name;
    initialized = true;
  });

  const nameDirty = $derived(name !== initialName);
  const passwordDirty = $derived(oldPassword.length > 0 || newPassword.length > 0);

  function setResponseErrors(
    error: ErrorResponseDto | undefined,
    fieldSetters: Record<string, (value: string | null) => void>,
    setGeneralError: (value: string | null) => void,
  ): void {
    let hasFieldErrors = false;

    for (const [field, setError] of Object.entries(fieldSetters)) {
      setError(null);
      const fieldError = error?.fields?.find((item) => item.field === field);
      if (!fieldError) {
        continue;
      }

      hasFieldErrors = true;
      setError(fieldError.errorDescription);
    }

    setGeneralError(hasFieldErrors ? null : (error?.errorDescription ?? null));
  }

  async function submitName(event: SubmitEvent): Promise<void> {
    event.preventDefault();

    nameError = null;
    nameFormError = null;
    savingName = true;

    const response = await changeName({ name: name.trim() }, { credentials: "include" });

    savingName = false;

    if (response.status === 200) {
      const nextProfile = {
        ...(sessionState.profile ?? {}),
        name: name.trim(),
      };

      sessionState.applyProfile(nextProfile);
      name = nextProfile.name ?? "";
      initialName = name;
      notificationsState.showInfo("Your name has been changed");
      return;
    }

    setResponseErrors(
      response.data,
      {
        name: (value) => (nameError = value),
      },
      (value) => (nameFormError = value),
    );
  }

  async function submitPassword(event: SubmitEvent): Promise<void> {
    event.preventDefault();

    oldPasswordError = null;
    newPasswordError = null;
    passwordFormError = null;

    const oldPasswordResult = PasswordSchema.safeParse(oldPassword);
    if (!oldPasswordResult.success) {
      oldPasswordError = oldPasswordResult.error.issues[0]?.message ?? "Required";
    }

    const newPasswordResult = PasswordSchema.safeParse(newPassword);
    if (!newPasswordResult.success) {
      newPasswordError = newPasswordResult.error.issues[0]?.message ?? "Required";
    }

    if (!oldPasswordResult.success || !newPasswordResult.success) {
      return;
    }

    savingPassword = true;

    const response = await changePassword({ oldPassword, newPassword }, { credentials: "include" });

    savingPassword = false;

    if (response.status === 200) {
      oldPassword = "";
      newPassword = "";
      notificationsState.showInfo("Your password has been changed");
      return;
    }

    setResponseErrors(
      response.data,
      {
        oldPassword: (value) => (oldPasswordError = value),
        newPassword: (value) => (newPasswordError = value),
      },
      (value) => (passwordFormError = value),
    );
  }
</script>

<div
  class="flex h-full min-h-0 flex-col rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:p-3"
>
  <PageTitle title="Profile" />

  <div
    class="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-[0_20px_45px_-25px_rgba(30,41,59,0.45)]
      backdrop-blur-md sm:p-6"
  >
    <h2 class="pb-3 text-slate-800">Change your name</h2>

    <form class="sm:max-w-md" onsubmit={submitName}>
      <Field>
        <FieldLabel for="profile-name">Name</FieldLabel>
        <Input id="profile-name" bind:value={name} maxlength={50} placeholder="Your name" error={nameError} />
        <FieldError error={nameError} />
      </Field>

      <FieldError class="mt-3" error={nameFormError} />

      <Button class="mt-4 w-30" submit spinner={savingName} disabled={!nameDirty}>Save</Button>
    </form>

    <h2 class="pt-10 pb-3 text-slate-800">Change password</h2>

    <form class="sm:max-w-md" onsubmit={submitPassword}>
      <Field>
        <FieldLabel for="old-password">Current password</FieldLabel>
        <Input
          id="old-password"
          bind:value={oldPassword}
          type={maskOldPassword ? "password" : "text"}
          error={oldPasswordError}
        >
          {#snippet rightAddon()}
            <ButtonEye
              off={!maskOldPassword}
              onclick={() => (maskOldPassword = !maskOldPassword)}
              class="mr-3"
              aria-label={maskOldPassword ? "Show current password" : "Hide current password"}
            />
          {/snippet}
        </Input>
        <FieldError error={oldPasswordError} />
      </Field>

      <Field class="mt-4">
        <FieldLabel for="new-password">New password</FieldLabel>
        <Input
          id="new-password"
          bind:value={newPassword}
          type={maskNewPassword ? "password" : "text"}
          error={newPasswordError}
        >
          {#snippet rightAddon()}
            <ButtonEye
              off={!maskNewPassword}
              onclick={() => (maskNewPassword = !maskNewPassword)}
              class="mr-3"
              aria-label={maskNewPassword ? "Show new password" : "Hide new password"}
            />
          {/snippet}
        </Input>
        <FieldError error={newPasswordError} />
      </Field>

      <FieldError class="mt-3" error={passwordFormError} />

      <Button class="mt-4 w-30" submit spinner={savingPassword} disabled={!passwordDirty}>Save</Button>
    </form>
  </div>
</div>
