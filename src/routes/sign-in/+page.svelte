<script lang="ts">
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import Button from "$lib/components/button/Button.svelte";
  import { checkSession, signIn, type SignInResponse } from "$lib/api/auth/auth";
  import { PATH_DASHBOARD } from "$lib/app/paths";
  import { createForm } from "$lib/form/form.svelte";
  import { type FormValues, initialValues, validator } from "./form.svelte";
  import { Input } from "$lib";
  import { Field, FieldError, FieldLabel } from "$lib/components/field";
  import PasswordInput from "./PasswordInput.svelte";
  import { onMount } from "svelte";
  import Alert from "$lib/components/alert/Alert.svelte";
  import Card from "$lib/components/card/Card.svelte";

  const form = createForm<FormValues, SignInResponse>(initialValues, validator, submit);
  let render = $state(false);

  const signUpOk = $derived(browser && page.url.searchParams.get("signUpOk") === "1");
  const sessionError = $derived(browser ? page.url.searchParams.get("sessionError") : null);

  onMount(async () => {
    try {
      const response = await checkSession({ credentials: "include" });
      if (response.status === 200) {
        await goto(PATH_DASHBOARD);
        return;
      }
    } finally {
      render = true;
    }
  });

  async function submit(values: FormValues): Promise<SignInResponse> {
    const response = await signIn(values, { credentials: "include" });

    if (response.status === 200) {
      await goto(PATH_DASHBOARD);
    }

    return response;
  }
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
      <Alert type="success">You have successfully registered. Use your email and password to sign in to the app.</Alert>
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

        <Button class="mt-5 w-full" submit spinner={form.loading}>Sign in</Button>
      </form>

      <p class="mt-10 text-center text-sm text-slate-500">
        No account?
        <a href="/sign-up">Sign up</a>
      </p>

      <p class="mt-2 text-center text-sm text-slate-500">
        Forgot password?
        <a href="/reset-password">Reset password</a>
      </p>
    </Card>
  </div>
{/if}
