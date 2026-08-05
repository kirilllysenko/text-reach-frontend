<script lang="ts">
  import { ChangePasswordStore } from "$houdini";
  import { Button, ButtonEye, Field, FieldError, FieldLabel, Input } from "$lib";
  import { networkErrorText } from "$lib/form/errors";
  import { PasswordSchema } from "$lib/form/validators";
  import { toGraphQLErrorText } from "$lib/graphql/errors";
  import { notificationsState } from "$lib/state/notifications.svelte";

  const changePasswordMutation = new ChangePasswordStore();

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

    let response;
    try {
      response = await changePasswordMutation.mutate({ input: { oldPassword, newPassword } });
    } catch {
      savingPassword = false;
      passwordFormError = networkErrorText;
      return;
    }

    savingPassword = false;

    if (!response.errors && response.data?.changePassword) {
      oldPassword = "";
      newPassword = "";
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
