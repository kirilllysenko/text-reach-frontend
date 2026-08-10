<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { cache, ContactGroupFormEditQueryStore, UpdateContactGroupStore } from "$houdini";
  import { BackButton, Button, Card, FieldError, PageTitle } from "$lib";
  import { PATH_CONTACT_GROUP } from "$lib/app/paths";
  import { networkErrorText } from "$lib/form/errors";
  import type { FormSubmitResult } from "$lib/form/form.svelte";
  import { notificationsState } from "$lib/state/notifications.svelte";
  import { onMount } from "svelte";
  import ContactGroupForm from "../../../components/ContactGroupForm.svelte";
  import { createContactGroupForm, type FormValues, type SubmitValues } from "../../../components/form/form.svelte";

  const contactGroupId = page.params.id;
  const editFormQuery = new ContactGroupFormEditQueryStore();
  const updateContactGroupMutation = new UpdateContactGroupStore();
  const form = createContactGroupForm(submit);

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
      if (!contactGroupId) {
        loadError = "Contact group was not found.";
        return;
      }

      const response = await editFormQuery.fetch({ variables: { id: contactGroupId } });
      if (response.errors || !response.data?.contactGroup) {
        loadError = "There was an error.";
        return;
      }

      const values: FormValues = {
        name: response.data.contactGroup.name,
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
      if (!contactGroupId) {
        return { error: "Contact group was not found." };
      }

      const response = await updateContactGroupMutation.mutate({ id: contactGroupId, input });
      if (response.errors) {
        return { error: "There was an error." };
      }

      cache.markStale("ContactGroupConnection");
      notificationsState.showInfo("Contact group has been updated");
      await goto(resolve(PATH_CONTACT_GROUP));
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
  <PageTitle title="Edit contact group">
    <BackButton />
  </PageTitle>

  <div class="flex min-h-0 grow justify-center overflow-y-auto pt-4 pb-18 sm:items-start">
    <Card variant="panel" class="w-full max-w-xl p-4 sm:p-6">
      {#if loadError}
        <div class="space-y-4 py-6 text-center">
          <FieldError error={loadError} />
          <Button variant="secondary" onclick={loadForm}>Try again</Button>
        </div>
      {:else}
        <ContactGroupForm {form} {loading} submitLabel="Update Contact Group" />
      {/if}
    </Card>
  </div>
</div>
