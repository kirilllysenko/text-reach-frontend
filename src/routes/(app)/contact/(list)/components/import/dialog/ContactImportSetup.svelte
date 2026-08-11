<script lang="ts">
  import { Button, Field, FieldError, FieldLabel } from "$lib";
  import ContactGroupCombobox from "$lib/feature/contact-group/ContactGroupCombobox.svelte";
  import Upload from "$lib/icons/Upload.svelte";
  import type { ContactImportState } from "../contact-import-state.svelte";

  interface Props {
    contactImport: ContactImportState;
    onClose: () => void;
  }

  let { contactImport, onClose }: Props = $props();
  let fileInput = $state<HTMLInputElement | null>(null);

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
        onchange={handleFileChange}
      />

      <Button variant="secondary" icon={Upload} onclick={() => fileInput?.click()}>Choose file</Button>

      <span class="min-w-0 truncate text-sm text-slate-600">{contactImport.selectedFileName}</span>
    </div>
  </Field>

  <Field>
    <ContactGroupCombobox
      value={contactImport.contactGroupIds}
      label="Contact groups"
      placeholder="Search groups"
      emptyText="No groups found"
      loadingText="Loading groups..."
      onChange={contactImport.setContactGroupIds}
    />
  </Field>

  <FieldError error={contactImport.error} />

  <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
    <Button variant="secondary" onclick={onClose}>Cancel</Button>
    <Button
      disabled={!contactImport.canContinue}
      spinner={contactImport.setupSubmitting}
      onclick={contactImport.continueToMapping}
    >
      Continue
    </Button>
  </div>
</section>
