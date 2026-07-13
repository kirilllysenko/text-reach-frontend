<script lang="ts">
  import { table } from "../table/table.svelte";
  import ContactImportDialog from "./ContactImportDialog.svelte";
  import ContactImportTrigger from "./ContactImportTrigger.svelte";
  import { createContactImportState } from "./contact-import-state.svelte";

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

<ContactImportTrigger {open} onOpen={openImportDialog} />
<ContactImportDialog {open} {contactImport} onClose={closeImportDialog} />
