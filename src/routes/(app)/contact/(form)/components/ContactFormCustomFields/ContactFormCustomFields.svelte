<script lang="ts">
  import { CustomFieldsQueryStore, type CustomFieldType$options } from "$houdini";
  import { Button, Field, FieldError, FieldLabel, Input } from "$lib";
  import { createFormValue, setFormShapeValue, type FormShape } from "text-reach-frontend-library/form";
  import { onMount } from "svelte";
  import type { HTMLInputTypeAttribute } from "svelte/elements";
  import type { FormValues } from "../form/form.svelte";

  interface Props {
    loading?: boolean;
    values: FormShape<FormValues["customFields"]>;
  }

  const customFieldsQuery = new CustomFieldsQueryStore();
  let { loading = false, values }: Props = $props();
  const loadingField = createFormValue("");

  const fields = $derived($customFieldsQuery.data?.customFields);
  const customFieldsLoading = $derived(loading || $customFieldsQuery.fetching);

  onMount(() =>
    customFieldsQuery.subscribe((result) => {
      const loadedFields = result.data?.customFields;
      if (!loadedFields) {
        return;
      }

      const fieldIds = loadedFields.map((field) => field.id);
      const valueIds = Object.keys(values);

      if (fieldIds.length === valueIds.length && fieldIds.every((fieldId) => valueIds.includes(fieldId))) {
        return;
      }

      setFormShapeValue(
        values,
        Object.fromEntries(loadedFields.map((field) => [field.id, values[field.id]?.value ?? ""])),
      );
    }),
  );

  function inputType(type: CustomFieldType$options): HTMLInputTypeAttribute {
    return type.toLowerCase();
  }
</script>

{#if fields && fields.length > 0}
  <section class="mt-5" aria-busy={customFieldsLoading}>
    <h2 class="mb-2 text-sm font-medium text-slate-700">Custom fields</h2>

    <div class="grid gap-4 sm:grid-cols-2">
      {#each fields as field (field.id)}
        <Field>
          <FieldLabel for={`contact-custom-field-${field.id}`}>
            {field.name}
          </FieldLabel>
          <Input
            id={`contact-custom-field-${field.id}`}
            field={values[field.id]}
            loading={customFieldsLoading}
            type={inputType(field.fieldType)}
          />
        </Field>
      {/each}
    </div>
  </section>
{:else if customFieldsLoading}
  <section class="mt-5" aria-busy="true">
    <h2 class="mb-2 text-sm font-medium text-slate-700">Custom fields</h2>

    <div class="grid gap-4 sm:grid-cols-2">
      {#each [0, 1] as placeholder (placeholder)}
        <Field aria-hidden="true">
          <div class="skeleton-loading h-4 w-24 rounded-lg"></div>
          <Input field={loadingField} loading />
        </Field>
      {/each}
    </div>
  </section>
{:else if $customFieldsQuery.errors}
  <div class="mt-5 flex items-center gap-3">
    <FieldError error="There was an error loading custom fields. Please try again." />
    <Button variant="secondary" onclick={() => customFieldsQuery.fetch()}>Retry</Button>
  </div>
{/if}
