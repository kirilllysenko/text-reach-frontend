<script lang="ts">
  import { Button, Field, FieldError, FieldLabel, MultiCombobox } from "$lib";
  import { loadContactGroupComboboxOptions } from "$lib/feature/contact-group/contact-group-combobox";
  import Upload from "$lib/icons/Upload.svelte";
  import type { ContactImportState } from "./contact-import-state.svelte";

  interface Props {
    contactImport: ContactImportState;
  }

  let { contactImport }: Props = $props();
  let fileInput = $state<HTMLInputElement | null>(null);
  const selectedFileName = $derived(contactImport.file?.name ?? "No file selected");
  const canContinue = $derived(Boolean(contactImport.file) && !contactImport.setupSubmitting);

  function handleFileChange(event: Event): void {
    const input = event.currentTarget as HTMLInputElement;
    contactImport.setFile(input.files?.[0] ?? null);
    input.value = "";
  }
</script>

<section class="space-y-4">
  <Field>
    <FieldLabel for="contact-import-file">Contacts file</FieldLabel>

    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        bind:this={fileInput}
        id="contact-import-file"
        class="hidden"
        type="file"
        accept=".csv,text/csv,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        disabled={contactImport.setupSubmitting}
        onchange={handleFileChange}
      />

      <Button
        variant="secondary"
        icon={Upload}
        disabled={contactImport.setupSubmitting}
        onclick={() => fileInput?.click()}
      >
        Choose file
      </Button>

      <span class="min-w-0 truncate text-sm text-slate-600">{selectedFileName}</span>
    </div>
  </Field>

  <Field>
    <MultiCombobox
      value={contactImport.contactGroupIds}
      loadOptions={loadContactGroupComboboxOptions}
      label="Contact groups"
      placeholder="Search groups"
      emptyText="No groups found"
      loadingText="Loading groups..."
      onChange={contactImport.setContactGroupIds}
    />
  </Field>

  <FieldError error={contactImport.displayError} />

  <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
    <Button variant="secondary" onclick={contactImport.closeDialog}>Cancel</Button>
    <Button disabled={!canContinue} spinner={contactImport.setupSubmitting} onclick={contactImport.prepareImport}>
      Continue
    </Button>
  </div>
</section>
