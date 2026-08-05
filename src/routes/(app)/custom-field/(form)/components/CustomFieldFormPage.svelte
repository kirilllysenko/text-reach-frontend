<script lang="ts">
  import { onMount } from "svelte";
  import { CustomFieldStore } from "$houdini";
  import { BackButton, Button, Field, FieldError, FieldLabel, Input, PageTitle, Select } from "$lib";
  import { PATH_CUSTOM_FIELD } from "$lib/app/paths";
  import { networkErrorText } from "$lib/form/errors";
  import { toGraphQLErrorText } from "$lib/graphql/errors";
  import {
    configureCustomFieldForm,
    form,
    getTypeOption,
    setCustomFieldFormValues,
    type FormMode,
    type TypeOption,
    typeOptions,
  } from "./form.svelte";

  interface Props {
    id?: string;
    mode: FormMode;
  }

  let { id, mode }: Props = $props();

  let initialName = $state("");
  let loadingField = $state(false);
  let selectedType = $state<TypeOption>(typeOptions[0]);
  const customFieldQuery = new CustomFieldStore();

  const title = $derived(mode === "create" ? "Add custom field" : "Edit custom field");
  const submitLabel = $derived(mode === "create" ? "Create" : "Save");
  const nameDirty = $derived(form.name.value.trim() !== initialName);
  const submitDisabled = $derived(form.loading || loadingField || (mode === "edit" && !nameDirty));

  onMount(() => {
    configureCustomFieldForm({ id, mode });
    initialName = "";
    selectedType = getTypeOption(form.type.value);

    if (mode === "edit") {
      loadingField = true;
      void loadCustomField();
    }
  });

  async function loadCustomField(): Promise<void> {
    if (!id) {
      form.error = "Custom field was not found.";
      loadingField = false;
      return;
    }

    try {
      const response = await customFieldQuery.fetch({ variables: { id } });

      if (response.errors || !response.data) {
        form.error = toGraphQLErrorText(response.errors);
        return;
      }

      const field = response.data.customField;

      setCustomFieldFormValues({
        name: field.name,
        type: field.fieldType,
      });
      initialName = field.name.trim();
      selectedType = getTypeOption(field.fieldType);
    } catch {
      form.error = networkErrorText;
    } finally {
      loadingField = false;
    }
  }

  function selectType(option: TypeOption): void {
    selectedType = option;
    form.type.value = option.id;
  }
</script>

<div
  class="flex h-dvh min-h-0 flex-col rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3"
>
  <PageTitle {title}>
    <BackButton href={PATH_CUSTOM_FIELD} />
  </PageTitle>

  <div class="flex min-h-0 grow items-center justify-center pb-18">
    <section
      class="w-full max-w-xl rounded-2xl border border-white/80 bg-white/75 p-4
        shadow-[0_20px_45px_-25px_rgba(30,41,59,0.45)] backdrop-blur-md sm:p-6"
    >
      <form onsubmit={form.submit} inert={form.loading || loadingField || undefined}>
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
            disabled={mode === "edit"}
            onChange={selectType}
          />
        </Field>

        <FieldError class="mt-3" error={form.error} />

        <div class="mt-5 flex justify-end gap-2">
          <a
            href={PATH_CUSTOM_FIELD}
            class="flex h-9 items-center justify-center rounded-xl border border-white/80 bg-white/80 px-3
              text-base font-medium text-slate-700 shadow-sm backdrop-blur-sm hover:bg-white"
          >
            Cancel
          </a>
          <Button submit spinner={form.loading} disabled={submitDisabled}>{submitLabel}</Button>
        </div>
      </form>
    </section>
  </div>
</div>
