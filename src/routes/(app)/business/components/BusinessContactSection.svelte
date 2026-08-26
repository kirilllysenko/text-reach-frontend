<script lang="ts">
  import { Field, FieldError, FieldLabel, Input } from "$lib";
  import type { BusinessProfileForm } from "./form/form.svelte";

  interface Props {
    form: BusinessProfileForm;
    loading?: boolean;
  }

  let { form, loading = false }: Props = $props();
</script>

<section class="border-t border-slate-200/70 pt-5" aria-labelledby="business-contact-heading">
  <h2 id="business-contact-heading" class="text-lg font-semibold text-slate-800">Business contact</h2>

  <div class="mt-4 grid gap-4 sm:grid-cols-2">
    <Field>
      <FieldLabel for="business-email">Business email</FieldLabel>
      <Input
        id="business-email"
        type="email"
        field={form.businessEmail}
        {loading}
        maxlength={255}
        autocomplete="email"
      />
      <FieldError error={form.businessEmail.error} />
    </Field>

    <Field>
      <FieldLabel for="business-phone">Business phone</FieldLabel>
      <Input
        id="business-phone"
        type="tel"
        field={form.businessPhone}
        {loading}
        maxlength={24}
        autocomplete="tel"
        placeholder="+1 415 555 0100"
      />
      <FieldError error={form.businessPhone.error} />
    </Field>

    <Field class="sm:col-span-2">
      <FieldLabel for="business-website">Website</FieldLabel>
      <Input
        id="business-website"
        type="url"
        field={form.website}
        {loading}
        maxlength={2048}
        autocomplete="url"
        placeholder="https://example.com"
      />
      <FieldError error={form.website.error} />
    </Field>
  </div>
</section>
