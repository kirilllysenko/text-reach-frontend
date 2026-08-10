<script lang="ts">
  import { Button, Field, FieldError, FieldLabel, Input, TextArea } from "$lib";
  import ContactGroupMultiCombobox from "$lib/feature/contact-group/MultiCombobox/ContactGroupMultiCombobox.svelte";
  import ContactFormCustomFields from "./ContactFormCustomFields/ContactFormCustomFields.svelte";
  import { createContactForm } from "./form/form.svelte";

  interface Props {
    form: ReturnType<typeof createContactForm>;
    loading?: boolean;
    submitLabel: string;
  }

  let { form, loading = false, submitLabel }: Props = $props();
</script>

<form onsubmit={form.submit} inert={form.loading || undefined} aria-busy={loading}>
  <div class="grid gap-4 sm:grid-cols-2">
    <Field>
      <FieldLabel for="contact-first-name">First name</FieldLabel>
      <Input id="contact-first-name" bind:value={form.firstName.value} {loading} maxlength={100} placeholder="Avery" />
    </Field>

    <Field>
      <FieldLabel for="contact-last-name">Last name</FieldLabel>
      <Input id="contact-last-name" bind:value={form.lastName.value} {loading} maxlength={100} placeholder="Johnson" />
    </Field>

    <Field>
      <FieldLabel for="contact-phone-number">Phone</FieldLabel>
      <Input
        id="contact-phone-number"
        bind:value={form.phoneNumber.value}
        {loading}
        maxlength={40}
        placeholder="+1 415 555 0127"
        error={form.phoneNumber.error}
      />
      <FieldError error={form.phoneNumber.error} />
    </Field>

    <Field>
      <FieldLabel for="contact-email">Email</FieldLabel>
      <Input
        id="contact-email"
        bind:value={form.email.value}
        {loading}
        maxlength={255}
        placeholder="avery@example.com"
        type="email"
        error={form.email.error}
      />
      <FieldError error={form.email.error} />
    </Field>

    <Field>
      <FieldLabel for="contact-birthday">Birthday</FieldLabel>
      <Input id="contact-birthday" bind:value={form.birthday.value} {loading} type="date" />
    </Field>
  </div>

  <Field class="mt-4">
    <FieldLabel for="contact-notes">Notes</FieldLabel>
    <TextArea
      id="contact-notes"
      bind:value={form.notes.value}
      {loading}
      maxlength={1000}
      rows={4}
      placeholder="Prefers afternoon texts"
    />
  </Field>

  <section class="mt-5">
    <ContactGroupMultiCombobox bind:value={form.contactGroupIds.value} id="contact-groups" {loading} />
  </section>

  <ContactFormCustomFields values={form.customFields} {loading} />

  <FieldError class="mt-3" error={form.error} />

  <div class="mt-5 flex justify-end gap-2">
    <Button variant="secondary" onclick={() => window.history.back()}>Cancel</Button>
    <Button submit spinner={form.loading} disabled={loading || form.loading}>{submitLabel}</Button>
  </div>
</form>
