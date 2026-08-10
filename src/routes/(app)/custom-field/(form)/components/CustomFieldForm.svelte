<script lang="ts">
  import { Button, Field, FieldError, FieldLabel, Input, Select } from "$lib";
  import { createCustomFieldForm, getTypeOption, type TypeOption, typeOptions } from "./form/form.svelte";

  interface Props {
    edit?: boolean;
    form: ReturnType<typeof createCustomFieldForm>;
    loading?: boolean;
    submitLabel: string;
  }

  let { edit = false, form, loading = false, submitLabel }: Props = $props();

  const selectedType = $derived(getTypeOption(form.type.value));

  function selectType(option: TypeOption): void {
    form.type.value = option.id;
  }
</script>

<form onsubmit={form.submit} inert={form.loading || undefined} aria-busy={loading}>
  <Field>
    <FieldLabel for="custom-field-name">Name</FieldLabel>
    <Input
      id="custom-field-name"
      bind:value={form.name.value}
      {loading}
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
      disabled={edit}
      {loading}
      onChange={selectType}
    />
  </Field>

  <FieldError class="mt-3" error={form.error} />

  <div class="mt-5 flex justify-end gap-2">
    <Button variant="secondary" onclick={() => window.history.back()}>Cancel</Button>
    <Button submit spinner={form.loading} disabled={loading || form.loading}>{submitLabel}</Button>
  </div>
</form>
