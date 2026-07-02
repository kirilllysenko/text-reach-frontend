<script lang="ts">
  import { buildGroupEditPath } from "$lib/app/paths";
  import type { ContactGroupViewModel } from "$lib/features/contact-groups/contact-groups-view-data";

  interface Props {
    group: ContactGroupViewModel;
  }

  let { group }: Props = $props();
</script>

<a
  href={buildGroupEditPath(group.id)}
  class="hover:text-sky-800 inline-flex h-7 items-center justify-center rounded-lg border border-white/80 bg-white/80
    px-2 text-sm font-medium text-sky-700 shadow-sm hover:bg-white"
>
  Edit
</a>
