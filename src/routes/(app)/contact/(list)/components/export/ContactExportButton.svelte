<script lang="ts">
  import { Button } from "$lib";
  import Download from "$lib/icons/Download.svelte";
  import type { ContactExportSnapshot } from "./contact-export";
  import { createContactExportState } from "./contact-export-state.svelte";

  interface Props {
    snapshot: ContactExportSnapshot;
  }

  let { snapshot }: Props = $props();
  const contactExport = createContactExportState();

  function exportContact(): void {
    void contactExport.exportContact(snapshot);
  }
</script>

<Button variant="secondary" small icon={Download} disabled={contactExport.exporting} onclick={exportContact}>
  <span class="hidden sm:inline">{contactExport.exporting ? "Exporting" : "Export"}</span>
</Button>
