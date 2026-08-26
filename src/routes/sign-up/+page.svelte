<script lang="ts">
  import { resolve } from "$app/paths";
  import { Button } from "$lib";
  import { PATH_SIGN_IN } from "$lib/app/paths";
  import { Field, FieldError, FieldLabel } from "text-reach-frontend-library/components/field";
  import EmailSection from "./components/EmailSection.svelte";
  import PhoneSection from "./components/PhoneSection.svelte";
  import Alert from "text-reach-frontend-library/components/alert/Alert.svelte";
  import Card from "text-reach-frontend-library/components/card/Card.svelte";
  import { createSignUpForm, setSignUpForm } from "./form.svelte";
  import PasswordInput from "text-reach-frontend-library/components/password-input/PasswordInput.svelte";

  const form = setSignUpForm(createSignUpForm());
  let { password } = form;
</script>

<div
  id="sign-up-page"
  class="flex min-h-full flex-col justify-center bg-linear-to-br from-slate-100 via-slate-50 to-stone-100 p-2"
  inert={form.loading || undefined}
>
  {#if form.error}
    <Alert type="error">
      {form.error}
    </Alert>
  {/if}

  <div class="mx-auto mb-1 max-w-md text-center">
    <p class="text-xs font-semibold tracking-[0.12em] text-sky-700 uppercase">No payment method required</p>
    <h1 class="mt-2 text-slate-800">Start your 7-day free trial</h1>
    <p class="mt-2 text-sm leading-6 text-slate-500">
      Set up your workspace now. Submit your business profile during the trial to prepare for full access.
    </p>
  </div>

  <Card>
    <form onsubmit={form.submit}>
      <EmailSection />

      <PhoneSection />

      <Field class="mt-4">
        <FieldLabel for="password">Password</FieldLabel>
        <PasswordInput id="password" field={password} autocomplete="new-password" placeholder="Create password" />
        <FieldError error={password.error} />
      </Field>

      <Button id="sign-up-submit" class="mt-5 w-full" submit spinner={form.loading}>Sign up</Button>
    </form>

    <p class="mt-10 text-center text-sm text-slate-500">
      Already have an account?
      <a href={resolve(PATH_SIGN_IN)}>Sign in</a>
    </p>
  </Card>
</div>
