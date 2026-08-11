<script lang="ts">
  import { Button } from "$lib";
  import type { ContactImportState } from "../contact-import-state.svelte";

  interface Props {
    contactImport: ContactImportState;
    onClose: () => void;
  }

  let { contactImport, onClose }: Props = $props();
</script>

<section class="space-y-4">
  <div class="bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 p-4 text-sm">
    Contact import has been queued. Processing continues in the background.
  </div>

  <div class="flex justify-end">
    <Button onclick={onClose}>Done</Button>
  </div>
</section>
