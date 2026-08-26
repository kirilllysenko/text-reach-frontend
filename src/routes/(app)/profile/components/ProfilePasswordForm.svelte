<script lang="ts">
  import { ChangePasswordStore } from "$houdini";
  import { Button, ButtonEye, Field, FieldError, FieldLabel, Input } from "$lib";
  import { networkErrorText } from "$lib/form/errors";
  import { createFormValue } from "text-reach-frontend-library/form";
  import { PasswordSchema } from "$lib/form/validators";
  import { toGraphQLErrorText } from "$lib/graphql/errors";
  import { getNotificationsState } from "$lib/state/notifications.svelte";
  const notificationsState = getNotificationsState();

  const changePasswordMutation = new ChangePasswordStore();

  const oldPassword = $state(createFormValue(""));
  const newPassword = $state(createFormValue(""));
  let passwordFormError = $state<string | null>(null);
  let maskOldPassword = $state(true);
  let maskNewPassword = $state(true);
  let savingPassword = $state(false);

  const passwordDirty = $derived(oldPassword.value.length > 0 || newPassword.value.length > 0);

  async function submitPassword(event: SubmitEvent): Promise<void> {
    event.preventDefault();

    oldPassword.error = null;
    newPassword.error = null;
    passwordFormError = null;

    const oldPasswordResult = PasswordSchema.safeParse(oldPassword.value);
    if (!oldPasswordResult.success) {
      oldPassword.error = oldPasswordResult.error.issues[0]?.message ?? "Required";
    }

    const newPasswordResult = PasswordSchema.safeParse(newPassword.value);
    if (!newPasswordResult.success) {
      newPassword.error = newPasswordResult.error.issues[0]?.message ?? "Required";
    }

    if (!oldPasswordResult.success || !newPasswordResult.success) {
      return;
    }

    savingPassword = true;

    let response;
    try {
      response = await changePasswordMutation.mutate({
        input: { oldPassword: oldPassword.value, newPassword: newPassword.value },
      });
    } catch {
      savingPassword = false;
      passwordFormError = networkErrorText;
      return;
    }

    savingPassword = false;

    if (!response.errors && response.data?.changePassword) {
      oldPassword.value = "";
      newPassword.value = "";
      notificationsState.showInfo("Your password has been changed");
      return;
    }

    passwordFormError = toGraphQLErrorText(response.errors);
  }
</script>

<section>
  <h2 class="pb-3 text-slate-800">Change password</h2>

  <form class="sm:max-w-md" onsubmit={submitPassword}>
    <Field>
      <FieldLabel for="old-password">Current password</FieldLabel>
      <Input id="old-password" field={oldPassword} type={maskOldPassword ? "password" : "text"}>
        {#snippet rightAddon()}
          <ButtonEye
            off={!maskOldPassword}
            onclick={() => (maskOldPassword = !maskOldPassword)}
            class="mr-3"
            aria-label={maskOldPassword ? "Show current password" : "Hide current password"}
          />
        {/snippet}
      </Input>
      <FieldError error={oldPassword.error} />
    </Field>

    <Field class="mt-4">
      <FieldLabel for="new-password">New password</FieldLabel>
      <Input id="new-password" field={newPassword} type={maskNewPassword ? "password" : "text"}>
        {#snippet rightAddon()}
          <ButtonEye
            off={!maskNewPassword}
            onclick={() => (maskNewPassword = !maskNewPassword)}
            class="mr-3"
            aria-label={maskNewPassword ? "Show new password" : "Hide new password"}
          />
        {/snippet}
      </Input>
      <FieldError error={newPassword.error} />
    </Field>

    <FieldError class="mt-3" error={passwordFormError} />

    <Button id="profile-password-submit" class="mt-4 w-30" submit spinner={savingPassword} disabled={!passwordDirty}>
      Save
    </Button>
  </form>
</section>
