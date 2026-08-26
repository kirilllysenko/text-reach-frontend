<script lang="ts">
  import { AccessGroup } from "$houdini/graphql/enums";
  import { resolve } from "$app/paths";
  import { buildContactEditPath } from "$lib/app/paths";
  import { getSessionState } from "$lib/state/session.svelte";
  import type { ContactTableRow } from "./column.svelte";
  const sessionState = getSessionState();

  interface Props {
    contact: ContactTableRow;
  }

  let { contact }: Props = $props();
</script>

{#if sessionState.hasAccess(AccessGroup.CONTACT_WRITE)}
  <a
    id={`contact-edit-${contact.id}`}
    href={resolve(buildContactEditPath(contact.id))}
    class="hover:text-sky-800 inline-flex h-7 items-center justify-center rounded-lg border border-white/80 bg-white/80
      px-2 text-sm font-medium text-sky-700 shadow-sm hover:bg-white"
  >
    Edit
  </a>
{/if}
