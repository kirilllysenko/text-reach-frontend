<script lang="ts">
  import { Field, FieldError, FieldLabel, Input } from "$lib";
  import type { BusinessProfileForm } from "./form/form.svelte";

  interface Props {
    form: BusinessProfileForm;
    loading?: boolean;
  }

  let { form, loading = false }: Props = $props();
</script>

<section class="border-t border-slate-200/70 pt-5" aria-labelledby="authorized-contact-heading">
  <h2 id="authorized-contact-heading" class="text-lg font-semibold text-slate-800">Authorized contact</h2>
  <p class="mt-1 text-sm text-slate-500">The person authorized to represent the business for messaging registration.</p>

  <div class="mt-4 grid gap-4 sm:grid-cols-2">
    <Field>
      <FieldLabel for="authorized-contact-first-name">First name</FieldLabel>
      <Input
        id="authorized-contact-first-name"
        bind:value={form.authorizedContact.firstName.value}
        {loading}
        maxlength={100}
        autocomplete="given-name"
        error={form.authorizedContact.firstName.error}
      />
      <FieldError error={form.authorizedContact.firstName.error} />
    </Field>

    <Field>
      <FieldLabel for="authorized-contact-last-name">Last name</FieldLabel>
      <Input
        id="authorized-contact-last-name"
        bind:value={form.authorizedContact.lastName.value}
        {loading}
        maxlength={100}
        autocomplete="family-name"
        error={form.authorizedContact.lastName.error}
      />
      <FieldError error={form.authorizedContact.lastName.error} />
    </Field>

    <Field>
      <FieldLabel for="authorized-contact-title">Title</FieldLabel>
      <Input
        id="authorized-contact-title"
        bind:value={form.authorizedContact.title.value}
        {loading}
        maxlength={100}
        autocomplete="organization-title"
        error={form.authorizedContact.title.error}
      />
      <FieldError error={form.authorizedContact.title.error} />
    </Field>

    <Field>
      <FieldLabel for="authorized-contact-phone">Phone</FieldLabel>
      <Input
        id="authorized-contact-phone"
        type="tel"
        bind:value={form.authorizedContact.phone.value}
        {loading}
        maxlength={24}
        autocomplete="tel"
        placeholder="+1 415 555 0101"
        error={form.authorizedContact.phone.error}
      />
      <FieldError error={form.authorizedContact.phone.error} />
    </Field>

    <Field class="sm:col-span-2">
      <FieldLabel for="authorized-contact-email">Email</FieldLabel>
      <Input
        id="authorized-contact-email"
        type="email"
        bind:value={form.authorizedContact.email.value}
        {loading}
        maxlength={255}
        autocomplete="email"
        error={form.authorizedContact.email.error}
      />
      <FieldError error={form.authorizedContact.email.error} />
    </Field>
  </div>
</section>
