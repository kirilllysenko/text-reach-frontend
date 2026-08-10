<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { cache, ContactFormEditQueryStore, UpdateContactStore } from "$houdini";
  import { BackButton, Button, Card, FieldError, PageTitle } from "$lib";
  import { PATH_CONTACT } from "$lib/app/paths";
  import { networkErrorText } from "$lib/form/errors";
  import type { FormSubmitResult } from "$lib/form/form.svelte";
  import { notificationsState } from "$lib/state/notifications.svelte";
  import { onMount } from "svelte";
  import ContactForm from "../../../components/ContactForm.svelte";
  import { createContactForm, type FormValues, type SubmitValues } from "../../../components/form/form.svelte";

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
        <ContactForm {form} {loading} submitLabel="Update Contact" />
      {/if}
    </Card>
  </div>
</div>
