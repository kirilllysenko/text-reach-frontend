<script lang="ts">
  import type { Snippet } from "svelte";
  import type { AccessGroup } from "$lib/api/index.schemas";
  import { currentUserState } from "$lib/state/current-user.svelte";

  interface Props {
    access: AccessGroup | readonly AccessGroup[];
    mode?: "all" | "any";
    children: Snippet;
  }

  let { access, mode = "all", children }: Props = $props();

  const accessGroups = $derived(Array.isArray(access) ? access : [access]);
  const allowed = $derived(
    mode === "any"
      ? currentUserState.hasAnyAccess(accessGroups)
      : accessGroups.every((accessGroup) => currentUserState.hasAccess(accessGroup)),
  );
</script>

{#if allowed}
  {@render children()}
{/if}
