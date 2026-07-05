<script lang="ts">
  import { Button } from "$lib";
  import Upload from "$lib/icons/Upload.svelte";
  import type { ContactImportState } from "./contact-import-state.svelte";

  interface Props {
    contactImport: ContactImportState;
  }

  let { contactImport }: Props = $props();
  let fileInput = $state<HTMLInputElement | null>(null);

  function openImportPicker(): void {
    fileInput?.click();
  }

  function handleImportChange(event: Event): void {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    void contactImport.importContact(file);
    input.value = "";
  }
</script>

<input bind:this={fileInput} class="hidden" type="file" accept=".csv,text/csv" onchange={handleImportChange} />

<Button secondary small disabled={contactImport.importing} onclick={openImportPicker}>
  <Upload class="size-4 fill-slate-700" />
  <span class="hidden sm:inline">{contactImport.importing ? "Importing" : "Import"}</span>
</Button>
