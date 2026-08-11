<script lang="ts">
  import { ResponsiveDialog } from "$lib";
  import ContactImportComplete from "./ContactImportComplete.svelte";
  import ContactImportMapping from "./mapping/ContactImportMapping.svelte";
  import ContactImportSetup from "./ContactImportSetup.svelte";
  import type { ContactImportState } from "../contact-import-state.svelte";

  interface Props {
    open: boolean;
    contactImport: ContactImportState;
    onClose: () => void;
  }

  let { open, contactImport, onClose }: Props = $props();
</script>

<ResponsiveDialog
  {open}
  title="Import contacts"
  description="Upload a file, review the columns, then choose which contact fields to import."
  {onClose}
>
  <div class="space-y-5">
    {#if contactImport.step === "setup"}
      <ContactImportSetup {contactImport} {onClose} />
    {:else if contactImport.step === "mapping"}
      <ContactImportMapping {contactImport} {onClose} />
    {:else}
      <ContactImportComplete {contactImport} {onClose} />
    {/if}
  </div>
</ResponsiveDialog>
