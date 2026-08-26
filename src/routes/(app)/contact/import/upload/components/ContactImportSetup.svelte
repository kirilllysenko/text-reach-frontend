<script lang="ts">
  import { Button, Field, FieldError, FieldLabel } from "$lib";
  import ContactGroupMultiCombobox from "$lib/feature/contact-group/MultiCombobox/ContactGroupMultiCombobox.svelte";
  import Upload from "text-reach-frontend-library/icons/Upload.svelte";
  import type { FormValue } from "text-reach-frontend-library/form";
  import { getContactImportState } from "./contact-import-state.svelte";

  interface Props {
    onClose: () => void;
  }

  let { onClose }: Props = $props();
  const contactImport = getContactImportState();
  let fileInput = $state<HTMLInputElement | null>(null);

  const contactGroupsField: FormValue<string[]> = {
    get value() {
      return contactImport.contactGroupIds;
    },
    set value(value) {
      contactImport.setContactGroupIds(value);
    },
    error: null,
  };

  function handleFileChange(event: Event): void {
    const input = event.currentTarget as HTMLInputElement;
    contactImport.setFile(input.files?.[0] ?? null);
    input.value = "";
  }

  function attachFileInput(element: HTMLInputElement): () => void {
    fileInput = element;
    return () => {
      if (fileInput === element) fileInput = null;
    };
  }
</script>

<section class="space-y-4">
  <Field>
    <FieldLabel for="contact-import-file">Contacts file</FieldLabel>

    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        {@attach attachFileInput}
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
    <ContactGroupMultiCombobox
      id="contact-import-groups"
      field={contactGroupsField}
      label="Contact groups"
      placeholder="Search groups"
      emptyText="No groups found"
      loadingText="Loading groups..."
    />
  </Field>

  <Field>
    <label
      class="bg-amber-50/80 text-amber-950 flex cursor-pointer items-start gap-3 rounded-xl border border-amber-200/80
        p-3 text-sm"
    >
      <input
        id="contact-import-consent"
        class="border-amber-400 accent-amber-700 mt-0.5 size-4 shrink-0 rounded"
        type="checkbox"
        checked={contactImport.consentConfirmed}
        onchange={(event) => contactImport.setConsentConfirmed(event.currentTarget.checked)}
      />

      <span class="space-y-1">
        <span class="block font-medium">
          I confirm that every contact in this file has consented to receive text messages from my organization.
        </span>
        <span class="block text-amber-800">
          Only import contacts who have agreed to receive messages. Keep proof of consent and honor opt-out requests.
        </span>
      </span>
    </label>
  </Field>

  <FieldError error={contactImport.error} />

  <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
    <Button id="contact-import-cancel" variant="secondary" onclick={onClose}>Cancel</Button>
    <Button
      id="contact-import-continue"
      disabled={!contactImport.canContinue}
      spinner={contactImport.setupSubmitting}
      onclick={contactImport.continueToMapping}
    >
      Continue
    </Button>
  </div>
</section>
