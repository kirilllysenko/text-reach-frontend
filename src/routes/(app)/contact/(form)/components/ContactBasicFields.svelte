<script lang="ts">
  import { Field, FieldError, FieldLabel, Input } from "$lib";
  import type { ContactForm } from "./form.svelte";

  interface Props {
    form: ContactForm;
  }

  let { form }: Props = $props();
</script>

<div class="grid gap-4 sm:grid-cols-2">
  <Field>
    <FieldLabel for="contact-first-name">First name</FieldLabel>
    <Input id="contact-first-name" bind:value={form.firstName.value} maxlength={100} placeholder="Avery" />
  </Field>

  <Field>
    <FieldLabel for="contact-last-name">Last name</FieldLabel>
    <Input id="contact-last-name" bind:value={form.lastName.value} maxlength={100} placeholder="Johnson" />
  </Field>

  <Field>
    <FieldLabel for="contact-phone-number">Phone</FieldLabel>
    <Input
      id="contact-phone-number"
      bind:value={form.phoneNumber.value}
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
      maxlength={255}
      placeholder="avery@example.com"
      type="email"
      error={form.email.error}
    />
    <FieldError error={form.email.error} />
  </Field>

  <Field>
    <FieldLabel for="contact-birthday">Birthday</FieldLabel>
    <Input id="contact-birthday" bind:value={form.birthday.value} type="date" />
  </Field>
</div>

<Field class="mt-4">
  <FieldLabel for="contact-notes">Notes</FieldLabel>
  <textarea
    id="contact-notes"
    bind:value={form.notes.value}
    maxlength={1000}
    rows="4"
    class="min-h-24 w-full resize-y rounded-[1.05rem] border-none bg-white/70 px-3 py-2 text-slate-700
      shadow-[inset_0px_0px_7px_3px_rgba(30,41,59,0.1)] transition-[box-shadow,background-color]
      duration-200 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500/25 focus:outline-none"
    placeholder="Prefers afternoon texts"
  ></textarea>
</Field>
