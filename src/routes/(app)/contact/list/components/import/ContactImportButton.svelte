<script lang="ts">
  import { table } from "../table/table.svelte";
  import ContactImportDialog from "./ContactImportDialog.svelte";
  import { createContactImportState } from "./contact-import-state.svelte";
  import Upload from "$lib/icons/Upload.svelte";
  import { Button } from "$lib";

  const contactImport = createContactImportState(table);
  let open = $state(false);

  function openImportDialog(): void {
    open = true;
    void contactImport.loadCustomFields();
  }

  function closeImportDialog(): void {
    if (contactImport.setupSubmitting || contactImport.importSubmitting) {
      return;
    }

    open = false;
    contactImport.reset();
  }
</script>

<Button variant="secondary" small icon={Upload} active={open} onclick={openImportDialog}>
  <span class="hidden sm:inline">Import</span>
</Button>

<ContactImportDialog {open} {contactImport} onClose={closeImportDialog} />
