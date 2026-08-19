<script lang="ts">
  import { buildContactGroupEditPath } from "$lib/app/paths";
  import type { ContactGroupTableRow } from "./column.svelte";

  interface Props {
    contactGroup: ContactGroupTableRow;
  }

  let { contactGroup }: Props = $props();
</script>

<a
  href={buildContactGroupEditPath(contactGroup.id)}
  class="hover:text-sky-800 inline-flex h-7 items-center justify-center rounded-lg border border-white/80 bg-white/80
    px-2 text-sm font-medium text-sky-700 shadow-sm hover:bg-white"
>
  Edit
</a>
