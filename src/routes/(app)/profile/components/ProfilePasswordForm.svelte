<script lang="ts">
  import { ChangePasswordStore } from "$houdini";
  import { Button, ButtonEye, Field, FieldError, FieldLabel, Input } from "$lib";
  import { networkErrorText } from "$lib/form/errors";
  import type { FormSubmitResult } from "text-reach-frontend-library/form";
  import { toGraphQLErrorText } from "$lib/graphql/errors";
  import { getNotificationsState } from "$lib/state/notifications.svelte";
  import {
    createProfilePasswordForm,
    initialPasswordValues,
    type ProfilePasswordSubmitValues,
  } from "./form/form.svelte";
  const notificationsState = getNotificationsState();

  const changePasswordMutation = new ChangePasswordStore();

  const form = createProfilePasswordForm(submitPassword);
  let maskOldPassword = $state(true);
  let maskNewPassword = $state(true);

  const passwordDirty = $derived(form.oldPassword.value.length > 0 || form.newPassword.value.length > 0);

  async function submitPassword(input: ProfilePasswordSubmitValues): Promise<FormSubmitResult> {
    try {
      const response = await changePasswordMutation.mutate({ input });

      if (response.errors || !response.data?.changePassword) {
        return { error: toGraphQLErrorText(response.errors) };
      }

      form.setValues(initialPasswordValues);
      notificationsState.showInfo("Your password has been changed");
      return {};
    } catch {
      return { error: networkErrorText };
    }
  }
</script>

<section>
  <h2 class="pb-3 text-slate-800">Change password</h2>

  <form class="sm:max-w-md" onsubmit={form.submit} inert={form.loading || undefined}>
    <Field>
      <FieldLabel for="old-password">Current password</FieldLabel>
      <Input id="old-password" field={form.oldPassword} type={maskOldPassword ? "password" : "text"}>
        {#snippet rightAddon()}
          <ButtonEye
            off={!maskOldPassword}
            onclick={() => (maskOldPassword = !maskOldPassword)}
            class="mr-3"
            aria-label={maskOldPassword ? "Show current password" : "Hide current password"}
          />
        {/snippet}
      </Input>
      <FieldError error={form.oldPassword.error} />
    </Field>

    <Field class="mt-4">
      <FieldLabel for="new-password">New password</FieldLabel>
      <Input id="new-password" field={form.newPassword} type={maskNewPassword ? "password" : "text"}>
        {#snippet rightAddon()}
          <ButtonEye
            off={!maskNewPassword}
            onclick={() => (maskNewPassword = !maskNewPassword)}
            class="mr-3"
            aria-label={maskNewPassword ? "Show new password" : "Hide new password"}
          />
        {/snippet}
      </Input>
      <FieldError error={form.newPassword.error} />
    </Field>

    <FieldError class="mt-3" error={form.error} />

    <Button
      id="profile-password-submit"
      class="mt-4 w-30"
      submit
      spinner={form.loading}
      disabled={!passwordDirty || form.loading}
    >
      Save
    </Button>
  </form>
</section>
