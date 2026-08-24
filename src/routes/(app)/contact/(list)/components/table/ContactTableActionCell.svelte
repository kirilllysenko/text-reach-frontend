<script lang="ts">
  import { AccessGroup } from "$houdini/graphql/enums";
  import { buildContactEditPath } from "$lib/app/paths";
  import { sessionState } from "$lib/state/session.svelte";
  import type { ContactTableRow } from "./column.svelte";

  interface Props {
    contact: ContactTableRow;
  }

  let { contact }: Props = $props();
</script>

{#if sessionState.hasAccess(AccessGroup.CONTACT_WRITE)}
  <a
    id={`contact-edit-${contact.id}`}
    href={buildContactEditPath(contact.id)}
    class="hover:text-sky-800 inline-flex h-7 items-center justify-center rounded-lg border border-white/80 bg-white/80
      px-2 text-sm font-medium text-sky-700 shadow-sm hover:bg-white"
  >
    Edit
  </a>
{/if}
