<script lang="ts">
  import { graphql } from "$houdini";
  import type { CustomFieldType$options } from "$houdini/graphql/enums";
  import { Button, Field, FieldLabel, Input } from "$lib";
  import { networkErrorText } from "$lib/form/errors";
  import { customFieldTypeLabelMap } from "$lib/feature/custom-field/custom-field-view-data";
  import { toGraphQLErrorText } from "$lib/graphql/errors";
  import { onMount, untrack } from "svelte";
  import type { ContactFormController, FormMode } from "./form.svelte";

  interface Props {
    contactForm: ContactFormController;
    id?: string;
    mode: FormMode;
  }

  let { contactForm, id, mode }: Props = $props();

  const options = untrack(() => ({ id, mode }));
  const form = untrack(() => contactForm.form);
  const createQuery = graphql(`
    query ContactCustomFieldsCreateQuery @cache(policy: NetworkOnly) {
      customFields {
        fieldType
        id
        name
      }
    }
  `);
  const editQuery = graphql(`
    query ContactCustomFieldsEditQuery($id: Ulid!) @cache(policy: NetworkOnly) {
      contact(id: $id) {
        customFields {
          customField {
            id
          }
          value
        }
      }
      customFields {
        fieldType
        id
        name
      }
    }
  `);

  const queryData = $derived(options.mode === "create" ? $createQuery.data : $editQuery.data);
  const customFields = $derived(queryData?.customFields ?? []);
  const loading = $derived(options.mode === "create" ? $createQuery.fetching : $editQuery.fetching);

  onMount(() => {
    void loadCustomFields();
  });

  async function loadCustomFields(): Promise<void> {
    try {
      if (options.mode === "create") {
        const response = await createQuery.fetch();
        if (response.errors || !response.data) {
          contactForm.setCustomFieldsError(toGraphQLErrorText(response.errors));
          return;
        }

        contactForm.setCustomFields(response.data.customFields);
        return;
      }

      if (!options.id) {
        contactForm.setCustomFieldsError("Contact was not found.");
        return;
      }

      const response = await editQuery.fetch({ variables: { id: options.id } });
      if (response.errors || !response.data?.contact) {
        contactForm.setCustomFieldsError(toGraphQLErrorText(response.errors));
        return;
      }

      contactForm.setCustomFields(
        response.data.customFields,
        Object.fromEntries(response.data.contact.customFields.map((field) => [field.customField.id, field.value])),
      );
    } catch {
      contactForm.setCustomFieldsError(networkErrorText);
    }
  }

  function inputType(type: CustomFieldType$options): "date" | "number" | "text" {
    if (type === "DATE") {
      return "date";
    }

    if (type === "NUMBER") {
      return "number";
    }

    return "text";
  }
</script>

{#if loading && customFields.length === 0}
  <p class="mt-5 text-sm text-slate-500">Loading custom fields…</p>
{:else if !contactForm.ready && customFields.length === 0}
  <div class="mt-5">
    <Button variant="secondary" onclick={loadCustomFields}>Retry custom fields</Button>
  </div>
{:else if customFields.length > 0}
  <section class="mt-5">
    <h2 class="mb-2 text-sm font-medium text-slate-700">Custom fields</h2>

    <div class="grid gap-4 sm:grid-cols-2">
      {#each customFields as field (field.id)}
        <Field>
          <FieldLabel for={`contact-custom-field-${field.id}`}>
            {field.name}
            <span class="font-normal text-slate-400">({customFieldTypeLabelMap[field.fieldType]})</span>
          </FieldLabel>
          <Input
            id={`contact-custom-field-${field.id}`}
            bind:value={form.customFieldValues[field.id].value}
            type={inputType(field.fieldType)}
          />
        </Field>
      {/each}
    </div>
  </section>
{/if}
