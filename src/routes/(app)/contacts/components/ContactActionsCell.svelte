<script lang="ts">
  import { buildContactEditPath } from "$lib/app/paths";
  import type { ContactViewModel } from "$lib/features/contacts/contacts-view-data";

  interface Props {
    contact: ContactViewModel;
  }

  let { contact }: Props = $props();
</script>

<a
  href={buildContactEditPath(contact.id)}
  class="hover:text-sky-800 inline-flex h-7 items-center justify-center rounded-lg border border-white/80 bg-white/80
    px-2 text-sm font-medium text-sky-700 shadow-sm hover:bg-white"
>
  Edit
</a>
