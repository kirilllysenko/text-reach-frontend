<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { cache, CreateContactStore } from "$houdini";
  import { BackButton, Button, Card, Field, FieldError, FieldLabel, Input, PageTitle, TextArea } from "$lib";
  import { PATH_CONTACT } from "$lib/app/paths";
  import { networkErrorText } from "$lib/form/errors";
  import type { FormSubmitResult } from "$lib/form/form.svelte";
  import { notificationsState } from "text-reach-frontend-library/state/notifications.svelte";
  import ContactGroupMultiCombobox from "$lib/feature/contact-group/MultiCombobox/ContactGroupMultiCombobox.svelte";
  import ContactFormCustomFields from "../../components/ContactFormCustomFields/ContactFormCustomFields.svelte";
  import { createAddContactForm, type SubmitValues } from "../../components/form/form.svelte";

  const createContactMutation = new CreateContactStore();
  const form = createAddContactForm(submit);

  async function submit(input: SubmitValues): Promise<FormSubmitResult> {
    try {
      const response = await createContactMutation.mutate({ input });
      if (response.errors) {
        return { error: "There was an error." };
      }

      cache.markStale("ContactConnection");
      notificationsState.showInfo("Contact has been created");
      await goto(resolve(PATH_CONTACT));
      return {};
    } catch {
      return { error: networkErrorText };
    }
  }
</script>

<div
  class="flex h-dvh min-h-0 flex-col rounded-2xl bg-linear-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle title="Add contact">
    <BackButton />
  </PageTitle>
  <div class="flex min-h-0 grow justify-center overflow-y-auto pt-4 pb-18 sm:items-start">
    <Card variant="panel" class="w-full max-w-3xl p-4 sm:p-6">
      <form onsubmit={form.submit} inert={form.loading || undefined}>
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
          <TextArea
            id="contact-notes"
            bind:value={form.notes.value}
            maxlength={1000}
            rows={4}
            placeholder="Prefers afternoon texts"
          />
        </Field>

        <section class="mt-5">
          <ContactGroupMultiCombobox bind:value={form.contactGroupIds.value} id="contact-groups" />
        </section>

        <ContactFormCustomFields values={form.customFields} />

        <Field class="mt-5">
          <label
            class={[
              `flex cursor-pointer items-start gap-3 rounded-xl border bg-white/70 p-4 transition-colors
              focus-within:ring-2 focus-within:ring-sky-500/25`,
              form.messagingConsent.error ? "border-rose-400" : "border-slate-200",
            ]}
          >
            <input
              id="contact-messaging-consent"
              class="accent-sky-600 mt-0.5 size-5 shrink-0 rounded border-slate-300"
              type="checkbox"
              bind:checked={form.messagingConsent.value}
              aria-describedby="contact-messaging-consent-description"
              aria-invalid={!!form.messagingConsent.error}
              aria-required="true"
            />
            <span class="min-w-0">
              <span class="block text-sm font-semibold text-slate-800">Messaging consent</span>
              <span id="contact-messaging-consent-description" class="mt-1 block text-sm leading-5 text-slate-600">
                I confirm this contact gave consent to receive text messages from this organization.
              </span>
            </span>
          </label>
          <FieldError error={form.messagingConsent.error} />
        </Field>

        <FieldError class="mt-3" error={form.error} />

        <div class="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onclick={() => window.history.back()}>Cancel</Button>
          <Button submit spinner={form.loading} disabled={form.loading}>Add Contact</Button>
        </div>
      </form>
    </Card>
  </div>
</div>
