<script lang="ts">
  import type { ContactImportState } from "../contact-import-state.svelte";

  interface Props {
    contactImport: ContactImportState;
  }

  let { contactImport }: Props = $props();
</script>

<div class="overflow-hidden rounded-xl border border-white/80 bg-white/70">
  <div class="border-b border-white/80 px-3 py-2 text-sm font-medium text-slate-700">Preview</div>
  <div class="max-h-72 overflow-auto">
    <table class="min-w-full table-fixed border-separate border-spacing-0 text-left text-sm">
      <thead class="sticky top-0 bg-slate-100 text-xs text-slate-500 uppercase">
        <tr>
          {#each contactImport.columns as column (column.index)}
            <th class="min-w-36 border-b border-white/80 px-3 py-2 font-medium">{column.label}</th>
          {/each}
        </tr>
      </thead>

      <tbody>
        {#each contactImport.previewRows as row, rowIndex}
          <tr class={rowIndex % 2 === 0 ? "bg-white/50" : "bg-slate-50/70"}>
            {#each contactImport.columns as column (column.index)}
              <td class="max-w-56 truncate border-b border-white/70 px-3 py-2 text-slate-700">
                {row[column.index] || "\u00A0"}
              </td>
            {/each}
          </tr>
        {:else}
          <tr>
            <td class="px-3 py-4 text-sm text-slate-500" colspan={contactImport.columns.length}>
              No preview rows to display.
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
