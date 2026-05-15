<script lang="ts">
  import { onMount } from "svelte";
  import Sidebar from "$lib/components/sidebar/Sidebar.svelte";
  import { appShellState } from "$lib/state/app-shell.svelte";
  import { sessionState } from "$lib/state/session.svelte";

  let { children } = $props();
  let render = $state(false);

  onMount(async () => {
    appShellState.closeSidebar();

    const canRender = await sessionState.ensureAppAccess();
    if (!canRender) {
      return;
    }

    await sessionState.loadProfile();
    render = true;
  });
</script>

{#if render}
  <div class="min-h-dvh bg-gradient-to-br from-slate-100 via-slate-50 to-stone-100">
    <div class="min-h-dvh sm:ml-70 sm:p-6">
      {@render children()}
    </div>

    <button
      class={[
        `fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-[1px] transition-opacity sm:hidden`,
        appShellState.sidebarOpened ? "opacity-30" : "pointer-events-none opacity-0",
      ]}
      type="button"
      onclick={() => appShellState.closeSidebar()}
      aria-label="Close sidebar"
    ></button>

    <aside
      class={[
        `fixed top-0 left-0 z-40 h-dvh w-70 overflow-y-auto border-r border-white/80 bg-white/70
          shadow-[0_20px_45px_-25px_rgba(30,41,59,0.45)] backdrop-blur-md transition-transform
          sm:translate-x-0`,
        appShellState.sidebarOpened ? "translate-x-0" : "-translate-x-full",
      ]}
    >
      <Sidebar onItemClicked={() => appShellState.closeSidebar()} />
    </aside>
  </div>
{:else}
  <div class="h-dvh bg-gradient-to-br from-slate-100 via-slate-50 to-stone-100"></div>
{/if}
