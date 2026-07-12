<script lang="ts">
  import { Button, FieldError, type DropdownOption } from "$lib";
  import {
    RegularContactImportFieldDto,
    type RegularContactImportFieldDto as RegularContactImportField,
  } from "$lib/api/index.schemas";
  import ContactImportMappingColumn from "./ContactImportMappingColumn.svelte";
  import ContactImportPreview from "./ContactImportPreview.svelte";
  import {
    CONTACT_IMPORT_IGNORE,
    createCustomContactImportMappingValue,
    createRegularContactImportMappingValue,
    type ContactImportMappingValue,
  } from "./contact-import-mapping.svelte";
  import type { ContactImportState } from "./contact-import-state.svelte";

  interface Props {
    contactImport: ContactImportState;
  }

  let { contactImport }: Props = $props();
  const canImport = $derived(
    Boolean(contactImport.mapping.uploadedFilename) && !contactImport.mapping.importSubmitting,
  );
  const regularFieldLabels = {
    [RegularContactImportFieldDto.PhoneNumber]: "Phone number",
    [RegularContactImportFieldDto.FirstName]: "First name",
    [RegularContactImportFieldDto.LastName]: "Last name",
    [RegularContactImportFieldDto.Email]: "Email",
    [RegularContactImportFieldDto.Birthday]: "Birthday",
    [RegularContactImportFieldDto.Notes]: "Notes",
  } satisfies Record<RegularContactImportField, string>;
  const mappingOptions: DropdownOption<ContactImportMappingValue>[] = $derived([
    { id: CONTACT_IMPORT_IGNORE, value: "Ignore column" },
    ...Object.values(RegularContactImportFieldDto).map((field) => ({
      id: createRegularContactImportMappingValue(field),
      value: regularFieldLabels[field],
    })),
    ...contactImport.mapping.customFields.map((field) => ({
      id: createCustomContactImportMappingValue(field.id),
      value: field.name,
    })),
  ]);
</script>

<section class="space-y-4">
  <div class="flex flex-col gap-3 rounded-xl border border-white/80 bg-white/70 p-3 sm:flex-row sm:items-center">
    <label class="flex items-center gap-2 text-sm font-medium text-slate-700">
      <input
        class="size-4 rounded border-slate-300 accent-slate-700"
        type="checkbox"
        checked={contactImport.mapping.skipFirstRow}
        onchange={(event) => contactImport.mapping.setSkipFirstRow(event.currentTarget.checked)}
      />
      First row contains headers
    </label>

    <span class="text-sm text-slate-500">
      Mapping file: <span class="font-medium text-slate-700">{contactImport.mapping.uploadedFilename}</span>
    </span>
  </div>

  <div class="space-y-3">
    <div class="grid gap-3 md:grid-cols-2">
      {#each contactImport.mapping.columns as column (column.index)}
        <ContactImportMappingColumn
          mapping={contactImport.mapping}
          options={mappingOptions}
          {column}
          onChange={contactImport.clearError}
        />
      {/each}
    </div>

    <ContactImportPreview mapping={contactImport.mapping} />
  </div>

  <FieldError error={contactImport.displayError} />

  <div class="flex flex-col gap-2 sm:flex-row sm:justify-between">
    <Button variant="secondary" onclick={contactImport.returnToSetup}>Back</Button>

    <div class="flex flex-col gap-2 sm:flex-row">
      <Button variant="secondary" onclick={contactImport.closeDialog}>Cancel</Button>
      <Button
        disabled={!canImport}
        spinner={contactImport.mapping.importSubmitting}
        onclick={contactImport.importContacts}
      >
        Import
      </Button>
    </div>
  </div>
</section>
