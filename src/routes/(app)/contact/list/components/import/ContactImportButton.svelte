<script lang="ts">
  import { table } from "../table/table.svelte";
  import ContactImportDialog from "./ContactImportDialog.svelte";
  import { createContactImportState } from "./contact-import-state.svelte";
  import Upload from "$lib/icons/Upload.svelte";
  import { Button } from "$lib";

  const contactImport = createContactImportState({
    async onImported() {
      await table.handlers.dataLoading.reload();
    },
  });
</script>

<Button variant="secondary" small icon={Upload} active={contactImport.open} onclick={contactImport.openDialog}>
  <span class="hidden sm:inline">Import</span>
</Button>

<ContactImportDialog {contactImport} />
