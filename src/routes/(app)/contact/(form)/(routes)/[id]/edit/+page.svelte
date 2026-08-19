<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { cache, ContactFormByIdStore, UpdateContactStore } from "$houdini";
  import { BackButton, Button, Card, Field, FieldError, FieldLabel, Input, PageTitle, TextArea } from "$lib";
  import { PATH_CONTACT } from "$lib/app/paths";
  import { networkErrorText } from "$lib/form/errors";
  import type { FormSubmitResult } from "$lib/form/form.svelte";
  import { notificationsState } from "text-reach-frontend-library/state/notifications.svelte";
  import { onMount } from "svelte";
  import ContactGroupMultiCombobox from "$lib/feature/contact-group/MultiCombobox/ContactGroupMultiCombobox.svelte";
  import ContactFormCustomFields from "../../../components/ContactFormCustomFields/ContactFormCustomFields.svelte";
  import { createContactForm, type FormValues, type SubmitValues } from "../../../components/form/form.svelte";

  const contactId = page.params.id;
  const formByIdQuery = new ContactFormByIdStore();
  const updateContactMutation = new UpdateContactStore();
  const form = createContactForm(submit);

  let loadError = $state<string | null>(null);
  let loading = $state(true);

  onMount(() => {
    void loadForm();
  });

  async function loadForm(): Promise<void> {
    loading = true;
    loadError = null;
    form.clearErrors();

    try {
      if (!contactId) {
        loadError = "Contact was not found.";
        return;
      }

      const contactResponse = await formByIdQuery.fetch({ variables: { id: contactId } });

      if (contactResponse.errors || !contactResponse.data?.contact) {
        loadError = "There was an error.";
        return;
      }

      const contact = contactResponse.data.contact;
      const currentCustomFieldValues = Object.fromEntries(
        contact.customFields.map((field) => [field.customField.id, field.value]),
      );

      const values: FormValues = {
        birthday: contact.birthday ?? "",
        contactGroupIds: contact.contactGroups.map((group) => group.id),
        customFields: currentCustomFieldValues,
        email: contact.email ?? "",
        firstName: contact.firstName ?? "",
        lastName: contact.lastName ?? "",
        notes: contact.notes ?? "",
        phoneNumber: contact.phoneNumber,
      };

      form.setValues(values);
    } catch {
      loadError = networkErrorText;
    } finally {
      loading = false;
    }
  }

  async function submit(input: SubmitValues): Promise<FormSubmitResult> {
    try {
      if (!contactId) {
        return { error: "Contact was not found." };
      }

      const response = await updateContactMutation.mutate({
        id: contactId,
        input,
      });

      if (response.errors) {
        return { error: "There was an error." };
      }

      cache.markStale("ContactConnection");
      notificationsState.showInfo("Contact has been updated");
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
  <PageTitle title="Edit contact">
    <BackButton />
  </PageTitle>

  <div class="flex min-h-0 grow justify-center overflow-y-auto pt-4 pb-18 sm:items-start">
    <Card variant="panel" class="w-full max-w-3xl p-4 sm:p-6">
      {#if loadError}
        <div class="space-y-4 py-6 text-center">
          <FieldError error={loadError} />
          <Button variant="secondary" onclick={loadForm}>Try again</Button>
        </div>
      {:else}
        <form onsubmit={form.submit} inert={form.loading || undefined} aria-busy={loading}>
          <div class="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel for="contact-first-name">First name</FieldLabel>
              <Input
                id="contact-first-name"
                bind:value={form.firstName.value}
                {loading}
                maxlength={100}
                placeholder="Avery"
              />
            </Field>

            <Field>
              <FieldLabel for="contact-last-name">Last name</FieldLabel>
              <Input
                id="contact-last-name"
                bind:value={form.lastName.value}
                {loading}
                maxlength={100}
                placeholder="Johnson"
              />
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
            <Button submit spinner={form.loading} disabled={loading || form.loading}>Update Contact</Button>
          </div>
        </form>
      {/if}
    </Card>
  </div>
</div>
