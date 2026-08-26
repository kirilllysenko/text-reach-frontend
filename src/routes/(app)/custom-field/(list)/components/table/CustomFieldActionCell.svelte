<script lang="ts">
  import { AccessGroup } from "$houdini/graphql/enums";
  import { buildCustomFieldEditPath } from "$lib/app/paths";
  import { sessionState } from "$lib/state/session.svelte";
  import type { CustomFieldTableRow } from "./column.svelte";

  interface Props {
    field: CustomFieldTableRow;
  }

  let { field }: Props = $props();
</script>

{#if sessionState.hasAccess(AccessGroup.CUSTOM_FIELDS_WRITE)}
  <a
    id={`custom-field-edit-${field.id}`}
    href={buildCustomFieldEditPath(field.id)}
    class="hover:text-sky-800 inline-flex h-7 items-center justify-center rounded-lg border border-white/80 bg-white/80
      px-2 text-sm font-medium text-sky-700 shadow-sm hover:bg-white"
  >
    Edit
  </a>
{/if}
