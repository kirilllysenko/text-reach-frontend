<script lang="ts">
  import { Select, type DropdownOption } from "$lib";
  import {
    CONTACT_IMPORT_IGNORE,
    type ContactImportMappingValue,
    type ContactImportMappingState,
  } from "./contact-import-mapping.svelte";
  import type { ContactImportPreviewColumn } from "./contact-import-file";

  interface Props {
    mapping: ContactImportMappingState;
    options: DropdownOption<ContactImportMappingValue>[];
    column: ContactImportPreviewColumn;
    onChange: () => void;
  }

  let { mapping, options, column, onChange }: Props = $props();

  const selectedMapping = $derived(mapping.mappings[column.index] ?? CONTACT_IMPORT_IGNORE);
  const selectedOption = $derived(options.find((option) => option.id === selectedMapping) ?? options[0]);

  function updateMapping(option: DropdownOption<ContactImportMappingValue>): void {
    mapping.updateMapping(column.index, option.id);
    onChange();
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
    {options}
    value={selectedOption}
    inputId={`contact-import-column-${column.index}`}
    popupVisibleItems={7}
    onChange={updateMapping}
  />
</div>
