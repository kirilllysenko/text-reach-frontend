<script lang="ts">
  import type { Snippet } from "svelte";
  import type { AccessGroup } from "$lib/api/index.schemas";
  import { currentUserState } from "$lib/state/current-user.svelte";

  interface Props {
    access?: AccessGroup;
    children: Snippet;
  }

  let { access, children }: Props = $props();
  const allowed = $derived(!access || currentUserState.hasAccess(access));
</script>

{#if allowed}
  {@render children()}
{:else}
  <div
    class="flex h-full min-h-0 flex-col rounded-2xl bg-linear-to-br from-slate-100 via-slate-50
      to-stone-100 p-2 sm:p-3"
  >
    <section
      class="flex min-h-0 grow flex-col items-center justify-center rounded-2xl border border-white/80 bg-white/75 p-6
        text-center shadow-[0_20px_45px_-25px_rgba(30,41,59,0.45)] backdrop-blur-md"
    >
      <h1 class="text-xl font-semibold text-slate-800">You don’t have access to this page</h1>
      <p class="mt-2 max-w-md text-sm text-slate-600">Contact an administrator if you need access.</p>
    </section>
  </div>
{/if}
