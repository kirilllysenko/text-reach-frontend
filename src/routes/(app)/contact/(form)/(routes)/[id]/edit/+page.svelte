<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { cache, ContactFormEditQueryStore, UpdateContactStore } from "$houdini";
  import { PATH_CONTACT } from "$lib/app/paths";
  import { BackButton, Button, Field, FieldError, FieldLabel, Input, PageTitle, TextArea } from "$lib/components";
  import { networkErrorText } from "$lib/form/errors";
  import { toGraphQLErrorText } from "$lib/graphql/errors";
  import { notificationsState } from "$lib/state/notifications.svelte";
  import { onMount } from "svelte";
  import ContactFormCustomFields from "../../../components/ContactFormCustomFields/ContactFormCustomFields.svelte";
  import { createContactForm, type FormValues, type SubmitValues } from "../../../components/form/form.svelte";
  import ContactGroupMultiCombobox from "$lib/feature/contact-group/MultiCombobox/ContactGroupMultiCombobox.svelte";
  import Card from "$lib";

  const contactId = page.params.id;
  const editFormQuery = new ContactFormEditQueryStore();
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

      const contactResponse = await editFormQuery.fetch({ variables: { id: contactId } });

      if (contactResponse.errors || !contactResponse.data?.contact) {
        loadError = toGraphQLErrorText(contactResponse.errors);
        return;
      }

      const contact = contactResponse.data.contact;
      const currentCustomFieldValues = Object.fromEntries(
        contact.customFields.map((field) => [field.customField.id, field.value]),
      );

      const values: FormValues = {
        birthday: contact.birthday?.slice(0, 10) ?? "",
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

  async function submit(input: SubmitValues): Promise {
    try {
      if (!contactId) {
        return contactFormError("Contact was not found.");
      }

      const response = await updateContactMutation.mutate({
        id: contactId,
        input,
      });

      if (response.errors || !response.data?.updateContact) {
        return contactFormError(toGraphQLErrorText(response.errors));
      }

      cache.markStale("ContactConnection");
      notificationsState.showInfo("Contact has been updated");
      await goto(resolve(PATH_CONTACT));
    } catch {
      return contactFormError(networkErrorText);
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
      {#if loading}
        <p class="py-8 text-center text-sm text-slate-500">Loading contact form…</p>
      {:else if loadError}
        <div class="space-y-4 py-6 text-center">
          <FieldError error={loadError} />
          {#if onRetry}
            <Button variant="secondary" onclick={onRetry}>Try again</Button>
          {/if}
        </div>
      {:else}
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

          <FieldError class="mt-3" error={form.error} />

          <div class="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onclick={() => window.history.back()}>Cancel</Button>
            <Button submit spinner={form.loading} disabled={form.loading}>Update Contact</Button>
          </div>
        </form>
      {/if}
    </Card>
  </div>
</div>
