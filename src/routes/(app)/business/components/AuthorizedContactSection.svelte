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
        field={form.authorizedContact.firstName}
        {loading}
        maxlength={100}
        autocomplete="given-name"
      />
      <FieldError error={form.authorizedContact.firstName.error} />
    </Field>

    <Field>
      <FieldLabel for="authorized-contact-last-name">Last name</FieldLabel>
      <Input
        id="authorized-contact-last-name"
        field={form.authorizedContact.lastName}
        {loading}
        maxlength={100}
        autocomplete="family-name"
      />
      <FieldError error={form.authorizedContact.lastName.error} />
    </Field>

    <Field>
      <FieldLabel for="authorized-contact-title">Title</FieldLabel>
      <Input
        id="authorized-contact-title"
        field={form.authorizedContact.title}
        {loading}
        maxlength={100}
        autocomplete="organization-title"
      />
      <FieldError error={form.authorizedContact.title.error} />
    </Field>

    <Field>
      <FieldLabel for="authorized-contact-phone">Phone</FieldLabel>
      <Input
        id="authorized-contact-phone"
        type="tel"
        field={form.authorizedContact.phone}
        {loading}
        maxlength={24}
        autocomplete="tel"
        placeholder="+1 415 555 0101"
      />
      <FieldError error={form.authorizedContact.phone.error} />
    </Field>

    <Field class="sm:col-span-2">
      <FieldLabel for="authorized-contact-email">Email</FieldLabel>
      <Input
        id="authorized-contact-email"
        type="email"
        field={form.authorizedContact.email}
        {loading}
        maxlength={255}
        autocomplete="email"
      />
      <FieldError error={form.authorizedContact.email.error} />
    </Field>
  </div>
</section>
