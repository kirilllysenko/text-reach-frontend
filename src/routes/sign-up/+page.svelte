<script lang="ts">
  import { Button } from "$lib";
  import { Field, FieldError, FieldLabel } from "$lib/components/field";
  import EmailSection from "./components/EmailSection.svelte";
  import PhoneSection from "./components/PhoneSection.svelte";
  import Alert from "$lib/components/alert/Alert.svelte";
  import Card from "$lib/components/card/Card.svelte";
  import { form } from "./form.svelte";
  import PasswordInput from "$lib/components/password-input/PasswordInput.svelte";

  let { password } = form;
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
      <EmailSection />

      <PhoneSection />

      <Field class="mt-4">
        <FieldLabel for="password">Password</FieldLabel>
        <PasswordInput
          id="password"
          bind:value={password.value}
          autocomplete="new-password"
          placeholder="Create password"
          error={password.error}
        />
        <FieldError error={password.error} />
      </Field>

      <Button class="mt-5 w-full" submit spinner={form.loading}>Sign up</Button>
    </form>

    <p class="mt-10 text-center text-sm text-slate-500">
      Already have an account?
      <a href="/sign-in">Sign in</a>
    </p>
  </Card>
</div>
