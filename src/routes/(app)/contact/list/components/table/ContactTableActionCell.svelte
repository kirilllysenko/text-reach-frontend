<script lang="ts">
  import { AccessGate } from "$lib";
  import { buildContactEditPath } from "$lib/app/paths";
  import { AccessGroup } from "$lib/api/index.schemas";
  import type { ContactViewModel } from "$lib/feature/contact/contact-view-data";

  interface Props {
    contact: ContactViewModel;
  }

  let { contact }: Props = $props();
</script>

<AccessGate access={AccessGroup.CONTACT_WRITE}>
  <a
    href={buildContactEditPath(contact.id)}
    class="hover:text-sky-800 inline-flex h-7 items-center justify-center rounded-lg border border-white/80 bg-white/80
      px-2 text-sm font-medium text-sky-700 shadow-sm hover:bg-white"
  >
    Edit
  </a>
</AccessGate>
