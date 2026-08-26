<script lang="ts">
  import { resolve } from "$app/paths";
  import { Button, Field, FieldError, FieldLabel } from "$lib";
  import { PATH_SIGN_IN } from "$lib/app/paths";
  import Alert from "text-reach-frontend-library/components/alert/Alert.svelte";
  import Card from "text-reach-frontend-library/components/card/Card.svelte";
  import PasswordInput from "text-reach-frontend-library/components/password-input/PasswordInput.svelte";
  import EmailSection from "./components/EmailSection.svelte";
  import { createResetPasswordForm, setResetPasswordForm } from "./form.svelte";

  const form = setResetPasswordForm(createResetPasswordForm());
  let { newPassword } = form;
</script>

<div
  id="reset-password-page"
  class="flex min-h-full flex-col justify-center bg-linear-to-br from-slate-100 via-slate-50 to-stone-100 p-2"
  inert={form.loading || undefined}
>
  {#if form.error}
    <Alert type="error">
      {form.error}
    </Alert>
  {/if}

  <div class="mx-auto mb-1 max-w-md text-center">
    <h1 class="text-slate-800">Reset password</h1>
    <p class="mt-2 text-sm leading-6 text-slate-500">
      Enter your email to receive a reset code, then choose a new password.
    </p>
  </div>

  <Card>
    <form onsubmit={form.submit}>
      <EmailSection />

      <Field class="mt-4">
        <FieldLabel for="new-password">New password</FieldLabel>
        <PasswordInput
          id="new-password"
          field={newPassword}
          autocomplete="new-password"
          placeholder="Create new password"
        />
        <FieldError error={newPassword.error} />
      </Field>

      <Button id="reset-password-submit" class="mt-5 w-full" submit spinner={form.loading}>Reset password</Button>
    </form>

    <p class="mt-10 text-center text-sm text-slate-500">
      Remembered your password?
      <a href={resolve(PATH_SIGN_IN)}>Sign in</a>
    </p>
  </Card>
</div>
