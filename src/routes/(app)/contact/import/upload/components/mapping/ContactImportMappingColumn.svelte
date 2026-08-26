<script lang="ts">
  import { Select } from "$lib";
  import type { FormValue } from "text-reach-frontend-library/form";
  import {
    CONTACT_IMPORT_IGNORE,
    type ContactImportMappingValue,
    type ContactImportPreviewColumn,
  } from "../contact-import";
  import { getContactImportState } from "../contact-import-state.svelte";

  interface Props {
    column: ContactImportPreviewColumn;
  }

  let { column }: Props = $props();
  const contactImport = getContactImportState();

  const mapping = $derived(contactImport.mappings[column.index] ?? CONTACT_IMPORT_IGNORE);
  const field: FormValue<ContactImportMappingValue> = {
    get value() {
      return mapping;
    },
    set value(value) {
      contactImport.updateMapping(column.index, value);
    },
    error: null,
  };
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
    {field}
    inputId={`contact-import-column-${column.index}`}
    popupVisibleItems={7}
  />
</div>
