<script lang="ts">
  import { Button, FieldError } from "$lib";
  import ContactImportMappingColumn from "./ContactImportMappingColumn.svelte";
  import ContactImportPreview from "./ContactImportPreview.svelte";
  import type { ContactImportState } from "./contact-import-state.svelte";

  interface Props {
    contactImport: ContactImportState;
    onClose: () => void;
  }

  let { contactImport, onClose }: Props = $props();
</script>

<section class="space-y-4">
  <div class="flex flex-col gap-3 rounded-xl border border-white/80 bg-white/70 p-3 sm:flex-row sm:items-center">
    <label class="flex items-center gap-2 text-sm font-medium text-slate-700">
      <input
        class="size-4 rounded border-slate-300 accent-slate-700"
        type="checkbox"
        checked={contactImport.skipFirstRow}
        onchange={(event) => contactImport.setSkipFirstRow(event.currentTarget.checked)}
      />
      First row contains headers
    </label>

    <span class="text-sm text-slate-500">
      Mapping file: <span class="font-medium text-slate-700">{contactImport.uploadedFilename}</span>
    </span>
  </div>

  <div class="space-y-3">
    <div class="grid gap-3 md:grid-cols-2">
      {#each contactImport.columns as column (column.index)}
        <ContactImportMappingColumn {contactImport} {column} />
      {/each}
    </div>

    <ContactImportPreview {contactImport} />
  </div>

  <FieldError error={contactImport.error} />

  <div class="flex flex-col gap-2 sm:flex-row sm:justify-between">
    <Button variant="secondary" onclick={() => (contactImport.step = "setup")}>Back</Button>

    <div class="flex flex-col gap-2 sm:flex-row">
      <Button variant="secondary" onclick={onClose}>Cancel</Button>
      <Button
        disabled={!contactImport.canImport}
        spinner={contactImport.importSubmitting}
        onclick={contactImport.importContacts}
      >
        Import
      </Button>
    </div>
  </div>
</section>
