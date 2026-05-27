<script lang="ts">
  import { Button, ButtonEye, Field, FieldError, FieldLabel, Input } from "$lib";
  import { changePassword } from "$lib/api/profile/profile";
  import { PasswordSchema } from "$lib/form/validators";
  import { notificationsState } from "$lib/state/notifications.svelte";
  import { setProfileResponseErrors } from "./profile-errors";

  let oldPassword = $state("");
  let newPassword = $state("");
  let oldPasswordError = $state<string | null>(null);
  let newPasswordError = $state<string | null>(null);
  let passwordFormError = $state<string | null>(null);
  let maskOldPassword = $state(true);
  let maskNewPassword = $state(true);
  let savingPassword = $state(false);

  const passwordDirty = $derived(oldPassword.length > 0 || newPassword.length > 0);

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

    setProfileResponseErrors(
      response.data,
      {
        oldPassword: (value) => (oldPasswordError = value),
        newPassword: (value) => (newPasswordError = value),
      },
      (value) => (passwordFormError = value),
    );
  }
</script>

<section>
  <h2 class="pb-3 text-slate-800">Change password</h2>

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
</section>
