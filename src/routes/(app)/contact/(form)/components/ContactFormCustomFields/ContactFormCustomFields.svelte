<script lang="ts">
  import { CustomFieldsQueryStore, type CustomFieldType$options } from "$houdini";
  import { Button, Field, FieldError, FieldLabel, Input } from "$lib";
  import { networkErrorText } from "$lib/form/errors";
  import { setFormShapeValue, type FormShape } from "$lib/form/form.svelte";
  import { toGraphQLErrorText } from "$lib/graphql/errors";
  import { onMount } from "svelte";
  import type { HTMLInputTypeAttribute } from "svelte/elements";
  import type { FormValues } from "../form/form.svelte";

  interface Props {
    values: FormShape<FormValues["customFields"]>;
  }

  const customFieldsQuery = new CustomFieldsQueryStore();
  let { values }: Props = $props();

  const fields = $derived($customFieldsQuery.data?.customFields);
  let loading = $state(true);

  onMount(() => {
    void load();
  });

  $effect(() => {
    if (!fields) {
      return;
    }

    const fieldIds = fields.map((field) => field.id);
    const valueIds = Object.keys(values);

    if (fieldIds.length === valueIds.length && fieldIds.every((fieldId) => valueIds.includes(fieldId))) {
      return;
    }

    setFormShapeValue(values, Object.fromEntries(fields.map((field) => [field.id, values[field.id]?.value ?? ""])));
  });

  async function load(): Promise<void> {
    loading = true;

    try {
      const response = await customFieldsQuery.fetch();
    } finally {
      loading = false;
    }
  }

  function inputType(type: CustomFieldType$options): HTMLInputTypeAttribute {
    return type.toLowerCase();
  }
</script>

{#if loading && !fields}
  <p class="mt-5 text-sm text-slate-500">Loading custom fields…</p>
{:else if $customFieldsQuery.errors}
  <div class="mt-5 flex items-center gap-3">
    <FieldError error="There was an error loading custom fields. Please try again." />
    <Button variant="secondary" onclick={load}>Retry</Button>
  </div>
{:else if fields && fields.length > 0}
  <section class="mt-5">
    <h2 class="mb-2 text-sm font-medium text-slate-700">Custom fields</h2>

    <div class="grid gap-4 sm:grid-cols-2">
      {#each fields as field (field.id)}
        <Field>
          <FieldLabel for={`contact-custom-field-${field.id}`}>
            {field.name}
          </FieldLabel>
          <Input
            id={`contact-custom-field-${field.id}`}
            bind:value={values[field.id].value}
            type={inputType(field.fieldType)}
          />
        </Field>
      {/each}
    </div>
  </section>
{/if}
