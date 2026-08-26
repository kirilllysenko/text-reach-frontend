<script lang="ts">
  import { Select, type DropdownOption } from "$lib";
  import {
    CONTACT_IMPORT_IGNORE,
    type ContactImportMappingValue,
    type ContactImportPreviewColumn,
  } from "../contact-import";
  import type { ContactImportState } from "../contact-import-state.svelte";

  interface Props {
    contactImport: ContactImportState;
    column: ContactImportPreviewColumn;
  }

  let { contactImport, column }: Props = $props();

  const mapping = $derived(contactImport.mappings[column.index] ?? CONTACT_IMPORT_IGNORE);

  function updateMapping(option: DropdownOption<ContactImportMappingValue>): void {
    contactImport.updateMapping(column.index, option.id);
  }
</script>

<div class="rounded-xl border border-white/80 bg-white/70 p-3">
  <div class="mb-2 flex items-center justify-between gap-3">
    <div class="min-w-0">
      <p class="truncate text-sm font-semibold text-slate-800">{column.label}</p>
      <p class="text-xs text-slate-500">Column {column.index + 1}</p>
    </div>
  </div>

  <Select
    options={contactImport.mappingOptions}
    value={contactImport.getMappingOption(mapping)}
    inputId={`contact-import-column-${column.index}`}
    popupVisibleItems={7}
    onChange={updateMapping}
  />
</div>
