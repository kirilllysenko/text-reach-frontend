<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { Button, Field, FieldError, FieldLabel, Input, PageTitle, Select } from "$lib";
  import { PATH_CUSTOM_FIELDS } from "$lib/app/paths";
  import type { CustomFieldType, ErrorResponse, Ulid } from "$lib/api/index.schemas";
  import { createCustomField, getCustomField, updateCustomFieldName } from "$lib/api/custom-field/custom-field";
  import { networkErrorText, toErrorText } from "$lib/form/errors";
  import { notificationsState } from "$lib/state/notifications.svelte";
  import { customFieldTypeLabelMap, customFieldTypeOptions } from "$lib/features/custom-fields/custom-fields-view-data";

  type FormMode = "create" | "edit";

  interface TypeOption {
    id: CustomFieldType;
    value: string;
  }

  interface Props {
    id?: string;
    mode: FormMode;
  }

  let { id, mode }: Props = $props();

  const typeOptions = customFieldTypeOptions.map((type) => ({
    id: type,
    value: customFieldTypeLabelMap[type],
  })) satisfies TypeOption[];

  let name = $state("");
  let initialName = $state("");
  let nameError = $state<string | null>(null);
  let formError = $state<string | null>(null);
  let loadingField = $state(false);
  let saving = $state(false);
  let selectedType = $state<TypeOption>(typeOptions[0]);

  const title = $derived(mode === "create" ? "Add custom field" : "Edit custom field");
  const submitLabel = $derived(mode === "create" ? "Create" : "Save");
  const nameDirty = $derived(name.trim() !== initialName);
  const submitDisabled = $derived(saving || loadingField || (mode === "edit" && !nameDirty));

  onMount(() => {
    if (mode === "edit") {
      loadingField = true;
      void loadCustomField();
    }
  });

  function getResponseError(error?: ErrorResponse): string {
    return error?.errorDescription ?? toErrorText(error?.errorCode);
  }

  function validate(): boolean {
    nameError = null;
    formError = null;

    if (!name.trim()) {
      nameError = "Required";
      return false;
    }

    return true;
  }

  async function loadCustomField(): Promise<void> {
    if (!id) {
      formError = "Custom field was not found.";
      loadingField = false;
      return;
    }

    try {
      const response = await getCustomField(id as Ulid, { credentials: "include" });

      if (response.status !== 200) {
        formError = getResponseError(response.data);
        return;
      }

      name = response.data.name;
      initialName = response.data.name.trim();
      selectedType = typeOptions.find((option) => option.id === response.data.type) ?? typeOptions[0];
    } catch {
      formError = networkErrorText;
    } finally {
      loadingField = false;
    }
  }

  async function submit(event: SubmitEvent): Promise<void> {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    saving = true;

    try {
      if (mode === "create") {
        await createField();
      } else {
        await updateField();
      }
    } catch {
      formError = networkErrorText;
    } finally {
      saving = false;
    }
  }

  async function createField(): Promise<void> {
    const response = await createCustomField(
      {
        name: name.trim(),
        type: selectedType.id,
      },
      { credentials: "include" },
    );

    if (response.status === 200) {
      notificationsState.showInfo("Custom field has been created");
      await goto(PATH_CUSTOM_FIELDS);
      return;
    }

    formError = getResponseError(response.data);
  }

  async function updateField(): Promise<void> {
    if (!id) {
      formError = "Custom field was not found.";
      return;
    }

    const response = await updateCustomFieldName(id as Ulid, { name: name.trim() }, { credentials: "include" });

    if (response.status === 200) {
      notificationsState.showInfo("Custom field has been updated");
      await goto(PATH_CUSTOM_FIELDS);
      return;
    }

    formError = getResponseError(response.data);
  }
</script>

<div
  class="flex h-dvh min-h-0 flex-col rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle {title}>
    <a
      href={PATH_CUSTOM_FIELDS}
      class="flex h-9 items-center justify-center rounded-xl border border-white/80 bg-white/80 px-3
        text-base font-medium text-slate-700 shadow-sm backdrop-blur-sm hover:bg-white"
    >
      Back
    </a>
  </PageTitle>

  <div class="flex min-h-0 grow items-center justify-center pb-18">
    <section
      class="w-full max-w-xl rounded-2xl border border-white/80 bg-white/75 p-4
        shadow-[0_20px_45px_-25px_rgba(30,41,59,0.45)] backdrop-blur-md sm:p-6"
    >
      <form onsubmit={submit} inert={saving || loadingField || undefined}>
        <Field>
          <FieldLabel for="custom-field-name">Name</FieldLabel>
          <Input id="custom-field-name" bind:value={name} maxlength={100} placeholder="Lead source" error={nameError} />
          <FieldError error={nameError} />
        </Field>

        <Field class="mt-4">
          <Select
            bind:value={selectedType}
            options={typeOptions}
            label="Type"
            inputId="custom-field-type"
            disabled={mode === "edit"}
          />
        </Field>

        <FieldError class="mt-3" error={formError} />

        <div class="mt-5 flex justify-end gap-2">
          <a
            href={PATH_CUSTOM_FIELDS}
            class="flex h-9 items-center justify-center rounded-xl border border-white/80 bg-white/80 px-3
              text-base font-medium text-slate-700 shadow-sm backdrop-blur-sm hover:bg-white"
          >
            Cancel
          </a>
          <Button submit spinner={saving} disabled={submitDisabled}>{submitLabel}</Button>
        </div>
      </form>
    </section>
  </div>
</div>
