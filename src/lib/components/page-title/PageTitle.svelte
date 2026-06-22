<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import Menu from "$lib/icons/Menu.svelte";
  import { appShellState } from "$lib/state/app-shell.svelte";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    title: string;
  }

  let { title, class: propClass, children, ...titleProps }: Props = $props();
</script>

<div {...titleProps} class={[`mb-3 flex items-center gap-3 px-3 text-slate-800 sm:mb-6 sm:px-0`, propClass]}>
  <button
    class="rounded-lg p-0.5 hover:cursor-pointer hover:bg-white/80 sm:hidden"
    type="button"
    onclick={() => appShellState.openSidebar()}
    aria-label="Open sidebar"
  >
    <Menu class="size-7 fill-slate-600" />
  </button>

  <span class="grow text-xl font-semibold sm:text-2xl">{title}</span>

  {@render children?.()}
</div>
