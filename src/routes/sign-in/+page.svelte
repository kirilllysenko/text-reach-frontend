<script lang="ts">
  import { page } from "$app/state";
  import Button from "$lib/components/button/Button.svelte";
  import { signIn, type SignInResponse } from "$lib/api/auth/auth";
  import { Form } from "$lib/form/form.svelte";
  import { type FormValues, initialValues, validator } from "./form.svelte";
  import { Input } from "$lib";
  import { Field, FieldError, FieldLabel } from "$lib/components/field";
  import PasswordInput from "./PasswordInput.svelte";

  const form = new Form<FormValues, SignInResponse>(initialValues, validator, submit);

  const signUpOk = $derived(page.url.searchParams.get("signUpOk") === "1");

  async function submit(values: FormValues): Promise<SignInResponse> {
    return signIn(values, { credentials: "include" });
  }
</script>

<div
  class="flex min-h-full flex-col justify-center bg-linear-to-br from-slate-100 via-slate-50 to-stone-100 p-2"
  inert={form.loading || undefined}
>
  {#if form.errors.general}
    <div
      class="mt-10 mb-5 rounded-xl border border-rose-200/80 bg-rose-100/90 p-2 text-center text-rose-800
          shadow-sm sm:mx-auto sm:w-md"
    >
      {form.errors.general}
    </div>
  {/if}

  {#if signUpOk}
    <div
      class={`mt-10 mb-5 rounded-xl border border-emerald-200/80 bg-emerald-100/90 p-2 text-center text-emerald-800
          shadow-sm sm:mx-auto sm:w-md`}
    >
      You have successfully registered. Use your email and password to sign in to the app.
    </div>
  {/if}

  <h1 class="mx-auto text-slate-800">Sign in</h1>

  <div
    class={`mt-10 rounded-2xl border border-white/80 bg-white/75 p-4
        shadow-[0_20px_45px_-25px_rgba(30,41,59,0.45)] backdrop-blur-md sm:mx-auto
        sm:w-md sm:p-6`}
  >
    <form onsubmit={form.submit}>
      <Field>
        <FieldLabel for="email">E-mail</FieldLabel>
        <Input
          id="email"
          bind:value={form.values.email}
          error={form.errors.email}
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
        />
        <FieldError error={form.errors.email} />
      </Field>

      <Field>
        <FieldLabel for="password">Password</FieldLabel>
        <PasswordInput id="password" bind:value={form.values.password} error={form.errors.password} />
        <FieldError error={form.errors.password} />
      </Field>

      <FieldError error={form.errors.general} />

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
  </div>
</div>
