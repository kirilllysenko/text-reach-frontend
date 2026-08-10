<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { cache, CreateCustomFieldStore } from "$houdini";
  import { BackButton, Button, Card, Field, FieldError, FieldLabel, Input, PageTitle, Select } from "$lib";
  import { PATH_CUSTOM_FIELD } from "$lib/app/paths";
  import { networkErrorText } from "$lib/form/errors";
  import type { FormSubmitResult } from "$lib/form/form.svelte";
  import { notificationsState } from "$lib/state/notifications.svelte";
  import {
    createCustomFieldForm,
    getTypeOption,
    type SubmitValues,
    type TypeOption,
    typeOptions,
  } from "../../components/form/form.svelte";

  const createCustomFieldMutation = new CreateCustomFieldStore();
  const form = createCustomFieldForm(submit);
  const selectedType = $derived(getTypeOption(form.type.value));

  function selectType(option: TypeOption): void {
    form.type.value = option.id;
  }

  async function submit(input: SubmitValues): Promise<FormSubmitResult> {
    try {
      const response = await createCustomFieldMutation.mutate({ input });
      if (response.errors) {
        return { error: "There was an error." };
      }

      cache.markStale("CustomField");
      notificationsState.showInfo("Custom field has been created");
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
  <PageTitle title="Add custom field">
    <BackButton />
  </PageTitle>

  <div class="flex min-h-0 grow justify-center overflow-y-auto pt-4 pb-18 sm:items-start">
    <Card variant="panel" class="w-full max-w-xl p-4 sm:p-6">
      <form onsubmit={form.submit} inert={form.loading || undefined}>
        <Field>
          <FieldLabel for="custom-field-name">Name</FieldLabel>
          <Input
            id="custom-field-name"
            bind:value={form.name.value}
            maxlength={100}
            placeholder="Lead source"
            error={form.name.error}
          />
          <FieldError error={form.name.error} />
        </Field>

        <Field class="mt-4">
          <Select
            value={selectedType}
            options={typeOptions}
            label="Type"
            inputId="custom-field-type"
            onChange={selectType}
          />
        </Field>

        <FieldError class="mt-3" error={form.error} />

        <div class="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onclick={() => window.history.back()}>Cancel</Button>
          <Button submit spinner={form.loading} disabled={form.loading}>Add Custom Field</Button>
        </div>
      </form>
    </Card>
  </div>
</div>
