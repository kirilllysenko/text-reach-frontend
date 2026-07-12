<script lang="ts">
  import { Button } from "$lib";
  import type { ContactImportState } from "./contact-import-state.svelte";

  interface Props {
    contactImport: ContactImportState;
  }

  let { contactImport }: Props = $props();
</script>

<section class="space-y-4">
  <div class="bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 p-4 text-sm">
    Imported <span class="font-semibold">{contactImport.importedCount}</span> contacts.
  </div>

  <div class="flex justify-end">
    <Button onclick={contactImport.closeDialog}>Done</Button>
  </div>
</section>
