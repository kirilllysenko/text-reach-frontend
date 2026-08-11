<script lang="ts">
  import ContactImportDialog from "./dialog/ContactImportDialog.svelte";
  import ContactImportTrigger from "./ContactImportTrigger.svelte";
  import { createContactImportState } from "./contact-import-state.svelte";

  interface Props {
    onImported: () => Promise<void> | void;
  }

  let { onImported }: Props = $props();
  const contactImport = createContactImportState({ refreshTable: () => onImported() });
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
