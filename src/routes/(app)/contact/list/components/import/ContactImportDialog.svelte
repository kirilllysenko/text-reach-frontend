<script lang="ts">
  import { ResponsiveDialog } from "$lib";
  import ContactImportComplete from "./ContactImportComplete.svelte";
  import ContactImportMapping from "./ContactImportMapping.svelte";
  import ContactImportSetup from "./ContactImportSetup.svelte";
  import type { ContactImportState } from "./contact-import-state.svelte";

  interface Props {
    contactImport: ContactImportState;
  }

  let { contactImport }: Props = $props();
</script>

<ResponsiveDialog
  open={contactImport.open}
  title="Import contacts"
  description="Upload a file, review the columns, then choose which contact fields to import."
  onClose={contactImport.closeDialog}
>
  <div class="space-y-5">
    {#if contactImport.step === "setup"}
      <ContactImportSetup {contactImport} />
    {:else if contactImport.step === "mapping"}
      <ContactImportMapping {contactImport} />
    {:else}
      <ContactImportComplete {contactImport} />
    {/if}
  </div>
</ResponsiveDialog>
