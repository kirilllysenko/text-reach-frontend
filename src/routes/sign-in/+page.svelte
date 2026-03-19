<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import Button from "$lib/components/button/Button.svelte";
  import { checkSession, signIn } from "$lib/api/auth/auth";
  import type { ErrorResponseDto, ErrorResponseDtoErrorCode as AuthErrorCode } from "$lib/api/index.schemas";
  import { ErrorResponseDtoErrorCode } from "$lib/api/index.schemas";
  import { Form } from "$lib/form/form.svelte";
  import { type FormValues, initialValues, validator } from "./form.svelte";
  import { Input } from "$lib";
  import { Field, FieldError, FieldLabel } from "$lib/components/field";
  import PasswordInput from "./PasswordInput.svelte";

  const form = new Form<FormValues>(initialValues, validator);

  let loading = $state(false);
  let authErrorCode = $state<AuthErrorCode | undefined>(undefined);

  const signUpOk = $derived(page.url.searchParams.get("signUpOk") === "1");

  function applyApiErrors(status: number, dto?: ErrorResponseDto): void {
    form.setErrors(status === 400 ? dto : undefined);

    if (dto?.errorDescription) {
      generalError = dto.errorDescription;
    } else if (status === 500) {
      generalError = "Something went wrong. Please try again.";
    } else if (status === 404) {
      generalError = "The changes could not be made because some data was not found. Please refresh the page.";
    } else {
      generalError = undefined;
    }
  }

  async function submit(event: SubmitEvent): Promise<void> {
    event.preventDefault();

    loading = true;
    try {
      const response = await signIn(form.toValues(), {
        credentials: "include",
      });

      if (response.status === 200) {
        await goto("/");
        return;
      }

      applyApiErrors(response.status, response.data as ErrorResponseDto);
    } catch {
      setGeneralError("Please check your internet connection and try again.");
    } finally {
      loading = false;
    }
  }
</script>

<div
  class="flex min-h-full flex-col justify-center p-2 bg-linear-to-br from-slate-100 via-slate-50 to-stone-100 test test test"
  inert={loading || undefined}
>
  {#if authErrorCode === ErrorResponseDtoErrorCode.SESSION_EXPIRED}
    <div
      class={`mt-10 sm:mx-auto sm:w-md p-2 mb-5 rounded-xl text-center border shadow-sm
          bg-rose-100/90 border-rose-200/80 text-rose-800`}
    >
      Your session has expired. Please sign in again.
    </div>
  {/if}

  {#if authErrorCode === ErrorResponseDtoErrorCode.SESSION_CLIENT_CHANGED}
    <div
      class={`mt-10 sm:mx-auto sm:w-md p-2 mb-5 rounded-xl text-center border shadow-sm
          bg-rose-100/90 border-rose-200/80 text-rose-800`}
    >
      Your browser has changed or your internet connection settings have changed. Please sign in again.
    </div>
  {/if}

  {#if signUpOk}
    <div
      class={`mt-10 sm:mx-auto sm:w-md p-2 mb-5 rounded-xl text-center border shadow-sm
          bg-emerald-100/90 border-emerald-200/80 text-emerald-800`}
    >
      You have successfully registered. Use your email and password to sign in to the app.
    </div>
  {/if}

  <h1 class="mx-auto text-slate-800">Sign in</h1>

  <div
    class={`mt-10 sm:mx-auto sm:w-md rounded-2xl border border-white/80
        bg-white/75 backdrop-blur-md shadow-[0_20px_45px_-25px_rgba(30,41,59,0.45)]
        p-4 sm:p-6`}
  >
    <form onsubmit={submit}>
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
        <PasswordInput id="password" bind:value={form.values.email} error={form.errors.email} />
        <FieldError error={form.errors.password} />
      </Field>

      <FieldError error={form.generalError} />

      <Button class="mt-5 w-full" submit spinner={loading}>Sign in</Button>
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
