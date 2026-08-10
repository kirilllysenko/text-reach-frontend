<script lang="ts">
  import { Button, Field, FieldError, FieldLabel, Input } from "$lib";
  import { createContactGroupForm } from "./form/form.svelte";

  interface Props {
    form: ReturnType<typeof createContactGroupForm>;
    loading?: boolean;
    submitLabel: string;
  }

  let { form, loading = false, submitLabel }: Props = $props();
</script>

<form onsubmit={form.submit} inert={form.loading || undefined} aria-busy={loading}>
  <Field>
    <FieldLabel for="contact-group-name">Name</FieldLabel>
    <Input
      id="contact-group-name"
      bind:value={form.name.value}
      {loading}
      maxlength={100}
      placeholder="Newsletter subscribers"
      error={form.name.error}
    />
    <FieldError error={form.name.error} />
  </Field>

  <FieldError class="mt-3" error={form.error} />

  <div class="mt-5 flex justify-end gap-2">
    <Button variant="secondary" onclick={() => window.history.back()}>Cancel</Button>
    <Button submit spinner={form.loading} disabled={loading || form.loading}>{submitLabel}</Button>
  </div>
</form>
