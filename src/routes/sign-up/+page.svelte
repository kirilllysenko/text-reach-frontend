<script lang="ts">
  import { goto } from "$app/navigation";
  import { Button } from "$lib";
  import { Field, FieldError, FieldLabel } from "$lib/components/field";
  import { signUp, type SignUpResponse } from "$lib/api/tenant/tenant";
  import { createForm } from "$lib/form/form.svelte";
  import { normalizePhoneNumber } from "$lib/form/validators";
  import { type FormValues, initialValues, validator } from "./form.svelte";
  import EmailSection from "./EmailSection.svelte";
  import PhoneSection from "./PhoneSection.svelte";
  import PasswordInput from "./PasswordInput.svelte";
  import Alert from "$lib/components/alert/Alert.svelte";
  import Card from "$lib/components/card/Card.svelte";

  const form = createForm<FormValues, SignUpResponse>(initialValues, validator, submit);

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
  {#if form.error}
    <Alert type="error">
      {form.error}
    </Alert>
  {/if}

  <h1 class="mx-auto text-slate-800">Try our solution for free</h1>

  <Card>
    <form onsubmit={form.submit}>
      <EmailSection email={form.email} emailCode={form.emailCode} />

      <PhoneSection phoneNumber={form.phoneNumber} phoneNumberCode={form.phoneNumberCode} />

      <Field class="mt-4">
        <FieldLabel for="password">Password</FieldLabel>
        <PasswordInput
          id="password"
          bind:value={form.password.value}
          autocomplete="new-password"
          placeholder="Create password"
          error={form.password.error}
        />
        <FieldError error={form.password.error} />
      </Field>

      <Button class="mt-5 w-full" submit spinner={form.loading}>Sign up</Button>
    </form>

    <p class="mt-10 text-center text-sm text-slate-500">
      Already have an account?
      <a href="/sign-in">Sign in</a>
    </p>
  </Card>
</div>
