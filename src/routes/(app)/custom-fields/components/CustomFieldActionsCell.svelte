<script lang="ts">
  import { buildCustomFieldEditPath } from "$lib/app/paths";
  import type { CustomFieldViewModel } from "$lib/features/custom-fields/custom-fields-view-data";

  interface Props {
    field: CustomFieldViewModel;
  }

  let { field }: Props = $props();
</script>

<a
  href={buildCustomFieldEditPath(field.id)}
  class="hover:text-sky-800 inline-flex h-7 items-center justify-center rounded-lg border border-white/80 bg-white/80
    px-2 text-sm font-medium text-sky-700 shadow-sm hover:bg-white"
>
  Edit
</a>
