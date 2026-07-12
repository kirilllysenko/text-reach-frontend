<script lang="ts">
  import { AccessGate } from "$lib";
  import { buildContactGroupEditPath } from "$lib/app/paths";
  import { AccessGroup } from "$lib/api/index.schemas";
  import type { ContactGroupViewModel } from "$lib/feature/contact-group/contact-group-view-data";

  interface Props {
    contactGroup: ContactGroupViewModel;
  }

  let { contactGroup }: Props = $props();
</script>

<AccessGate access={AccessGroup.CONTACT_WRITE}>
  <a
    href={buildContactGroupEditPath(contactGroup.id)}
    class="hover:text-sky-800 inline-flex h-7 items-center justify-center rounded-lg border border-white/80 bg-white/80
      px-2 text-sm font-medium text-sky-700 shadow-sm hover:bg-white"
  >
    Edit
  </a>
</AccessGate>
