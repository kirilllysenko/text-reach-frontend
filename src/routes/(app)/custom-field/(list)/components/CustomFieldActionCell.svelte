<script lang="ts">
  import { AccessGate } from "$lib";
  import { buildCustomFieldEditPath } from "$lib/app/paths";
  import { AccessGroup } from "$lib/api/index.schemas";
  import type { CustomFieldViewModel } from "$lib/feature/custom-field/custom-field-view-data";

  interface Props {
    field: CustomFieldViewModel;
  }

  let { field }: Props = $props();
</script>

<AccessGate access={AccessGroup.CUSTOM_FIELDS_WRITE}>
  <a
    href={buildCustomFieldEditPath(field.id)}
    class="hover:text-sky-800 inline-flex h-7 items-center justify-center rounded-lg border border-white/80 bg-white/80
      px-2 text-sm font-medium text-sky-700 shadow-sm hover:bg-white"
  >
    Edit
  </a>
</AccessGate>
