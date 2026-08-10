<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { cache, CustomFieldFormEditQueryStore, UpdateCustomFieldNameStore } from "$houdini";
  import { BackButton, Button, Card, FieldError, PageTitle } from "$lib";
  import { PATH_CUSTOM_FIELD } from "$lib/app/paths";
  import { networkErrorText } from "$lib/form/errors";
  import type { FormSubmitResult } from "$lib/form/form.svelte";
  import { notificationsState } from "$lib/state/notifications.svelte";
  import { onMount } from "svelte";
  import CustomFieldForm from "../../../components/CustomFieldForm.svelte";
  import { createCustomFieldForm, type FormValues, type SubmitValues } from "../../../components/form/form.svelte";

  const customFieldId = page.params.id;
  const editFormQuery = new CustomFieldFormEditQueryStore();
  const updateCustomFieldNameMutation = new UpdateCustomFieldNameStore();
  const form = createCustomFieldForm(submit);

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
      if (!customFieldId) {
        loadError = "Custom field was not found.";
        return;
      }

      const response = await editFormQuery.fetch({ variables: { id: customFieldId } });
      if (response.errors || !response.data?.customField) {
        loadError = "There was an error.";
        return;
      }

      const values: FormValues = {
        name: response.data.customField.name,
        type: response.data.customField.fieldType,
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
      if (!customFieldId) {
        return { error: "Custom field was not found." };
      }

      const response = await updateCustomFieldNameMutation.mutate({ id: customFieldId, name: input.name });
      if (response.errors) {
        return { error: "There was an error." };
      }

      cache.markStale("CustomField");
      notificationsState.showInfo("Custom field has been updated");
      await goto(resolve(PATH_CUSTOM_FIELD));
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
  <PageTitle title="Edit custom field">
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
        <CustomFieldForm edit {form} {loading} submitLabel="Update Custom Field" />
      {/if}
    </Card>
  </div>
</div>
