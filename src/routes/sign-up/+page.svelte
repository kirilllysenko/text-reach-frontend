<script lang="ts">
  import { goto } from "$app/navigation";
  import { Button } from "$lib";
  import { Field, FieldError, FieldLabel } from "$lib/components/field";
  import { signUp, type SignUpResponse } from "$lib/api/sign-up/sign-up";
  import { Form } from "$lib/form/form.svelte";
  import { normalizePhoneNumber } from "$lib/form/validators";
  import { type FormValues, initialValues, validator } from "./form.svelte";
  import EmailSection from "./EmailSection.svelte";
  import PhoneSection from "./PhoneSection.svelte";
  import PasswordInput from "./PasswordInput.svelte";

  const form = new Form<FormValues, SignUpResponse>(initialValues, validator, submit);

  async function submit(values: FormValues): Promise<SignUpResponse> {
    const response = await signUp(
      {
        email: values.email,
        emailCode: values.emailCode,
        phoneNumber: normalizePhoneNumber(values.phoneNumber),
        phoneNumberCode: values.phoneNumberCode,
        password: values.password,
      },
      { credentials: "include" },
    );

    if (response.status === 200) {
      await goto("/sign-in?signUpOk=1");
    }

    return response;
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

  <h1 class="mx-auto text-slate-800">Try our solution for free</h1>

  <div
    class="mt-10 rounded-2xl border border-white/80 bg-white/75 p-4
      shadow-[0_20px_45px_-25px_rgba(30,41,59,0.45)] backdrop-blur-md sm:mx-auto
      sm:w-md sm:p-6"
  >
    <form onsubmit={form.submit}>
      <EmailSection
        bind:email={form.values.email}
        bind:emailCode={form.values.emailCode}
        bind:emailError={form.errors.email}
        bind:emailCodeError={form.errors.emailCode}
      />

      <PhoneSection
        bind:phoneNumber={form.values.phoneNumber}
        bind:phoneNumberCode={form.values.phoneNumberCode}
        bind:phoneNumberError={form.errors.phoneNumber}
        bind:phoneNumberCodeError={form.errors.phoneNumberCode}
      />

      <Field class="mt-4">
        <FieldLabel for="password">Password</FieldLabel>
        <div class="relative mt-1">
          <PasswordInput
            id="password"
            bind:value={form.values.password}
            autocomplete="new-password"
            placeholder="Create password"
            error={form.errors.password}
          />
        </div>
        <FieldError error={form.errors.password} />
      </Field>

      <Button class="mt-5 w-full" submit spinner={form.loading}>Sign up</Button>
    </form>

    <p class="mt-10 text-center text-sm text-slate-500">
      Already have an account?
      <a href="/sign-in">Sign in</a>
    </p>
  </div>
</div>
