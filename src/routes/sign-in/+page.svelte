<script lang="ts">
  import { browser } from "$app/environment";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import Button from "text-reach-frontend-library/components/button/Button.svelte";
  import { form, redirectActiveSession } from "./form.svelte";
  import { Input } from "$lib";
  import { Field, FieldError, FieldLabel } from "text-reach-frontend-library/components/field";
  import PasswordInput from "./components/PasswordInput.svelte";
  import { onMount } from "svelte";
  import Alert from "text-reach-frontend-library/components/alert/Alert.svelte";
  import Card from "text-reach-frontend-library/components/card/Card.svelte";

  let render = $state(false);

  const signUpOk = $derived(browser && page.url.searchParams.get("signUpOk") === "1");
  const resetPasswordOk = $derived(browser && page.url.searchParams.get("resetPasswordOk") === "1");
  const sessionError = $derived(browser ? page.url.searchParams.get("sessionError") : null);

  onMount(async () => {
    try {
      await redirectActiveSession();
    } finally {
      render = true;
    }
  });
</script>

{#if render}
  <div
    class="flex min-h-full flex-col justify-center bg-linear-to-br from-slate-100 via-slate-50
      to-stone-100 p-2"
    inert={form.loading || undefined}
  >
    {#if sessionError === "SESSION_EXPIRED"}
      <Alert type="warning">Your session has expired. Please sign in again.</Alert>
    {/if}

    {#if sessionError === "SESSION_CLIENT_CHANGED"}
      <Alert type="warning">
        Your browser has changed or your internet connection settings have changed. Please sign in again.
      </Alert>
    {/if}

    {#if form.error}
      <Alert type="error">
        {form.error}
      </Alert>
    {/if}

    {#if signUpOk}
      <Alert id="sign-up-success" type="success">
        Your 7-day trial has started. Use your email and password to sign in.
      </Alert>
    {/if}

    {#if resetPasswordOk}
      <Alert id="reset-password-success" type="success">
        Your password has been reset. Sign in with your new password.
      </Alert>
    {/if}

    <h1 class="mx-auto text-slate-800">Sign in</h1>

    <Card>
      <form onsubmit={form.submit}>
        <Field>
          <FieldLabel for="email">E-mail</FieldLabel>
          <Input
            id="email"
            bind:value={form.email.value}
            error={form.email.error}
            autocomplete="email"
            placeholder="you@example.com"
          />
          <FieldError error={form.email.error} />
        </Field>

        <Field>
          <FieldLabel for="password">Password</FieldLabel>
          <PasswordInput id="password" bind:value={form.password.value} error={form.password.error} />
          <FieldError error={form.password.error} />
        </Field>

        <FieldError error={form.error} />

        <Button id="sign-in-submit" class="mt-5 w-full" submit spinner={form.loading}>Sign in</Button>
      </form>

      <p class="mt-10 text-center text-sm text-slate-500">
        No account?
        <a href={resolve("/sign-up")}>Sign up</a>
      </p>

      <p class="mt-2 text-center text-sm text-slate-500">
        Forgot password?
        <a href={resolve("/reset-password")}>Reset password</a>
      </p>
    </Card>
  </div>
{/if}
