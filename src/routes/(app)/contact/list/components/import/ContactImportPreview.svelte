<script lang="ts">
  import type { ContactImportMappingState } from "./contact-import-mapping.svelte";

  interface Props {
    mapping: ContactImportMappingState;
  }

  let { mapping }: Props = $props();
  const previewRows = $derived(mapping.rows.slice(mapping.skipFirstRow ? 1 : 0, mapping.skipFirstRow ? 11 : 10));
</script>

<div class="overflow-hidden rounded-xl border border-white/80 bg-white/70">
  <div class="border-b border-white/80 px-3 py-2 text-sm font-medium text-slate-700">Preview</div>
  <div class="max-h-72 overflow-auto">
    <table class="min-w-full table-fixed border-separate border-spacing-0 text-left text-sm">
      <thead class="sticky top-0 bg-slate-100 text-xs text-slate-500 uppercase">
        <tr>
          {#each mapping.columns as column (column.index)}
            <th class="min-w-36 border-b border-white/80 px-3 py-2 font-medium">{column.label}</th>
          {/each}
        </tr>
      </thead>

      <tbody>
        {#each previewRows as row, rowIndex}
          <tr class={rowIndex % 2 === 0 ? "bg-white/50" : "bg-slate-50/70"}>
            {#each mapping.columns as column (column.index)}
              <td class="max-w-56 truncate border-b border-white/70 px-3 py-2 text-slate-700">
                {row[column.index] || "\u00A0"}
              </td>
            {/each}
          </tr>
        {:else}
          <tr>
            <td class="px-3 py-4 text-sm text-slate-500" colspan={mapping.columns.length}>
              No preview rows to display.
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
