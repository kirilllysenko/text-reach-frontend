<script lang="ts">
  import { Button } from "$lib";
  import Download from "$lib/icons/Download.svelte";
  import type { ContactExportSnapshot } from "./contact-export";
  import type { ContactExportState } from "./contact-export-state.svelte";

  interface Props {
    contactExport: ContactExportState;
    snapshot: ContactExportSnapshot;
  }

  let { contactExport, snapshot }: Props = $props();

  function exportContact(): void {
    void contactExport.exportContact(snapshot);
  }
</script>

<Button secondary small disabled={contactExport.exporting} onclick={exportContact}>
  <Download class="size-4 fill-slate-700" />
  <span class="hidden sm:inline">{contactExport.exporting ? "Exporting" : "Export"}</span>
</Button>
