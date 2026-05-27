<script lang="ts">
  import type { Snippet } from "svelte";
  import ResponsiveDialogDesktop from "./ResponsiveDialogDesktop.svelte";
  import ResponsiveDialogMobile from "./ResponsiveDialogMobile.svelte";

  interface Props {
    open: boolean;
    title: string;
    description?: string;
    onClose: () => void;
    children?: Snippet;
    mobileFooter?: Snippet;
  }

  let { open, title, description, onClose, children, mobileFooter }: Props = $props();
</script>

{#if open}
  <button
    class="fixed inset-0 z-40 bg-slate-900/35 backdrop-blur-[1px] sm:bg-slate-900/30 sm:backdrop-blur-[2px]"
    type="button"
    aria-label={`Close ${title}`}
    onclick={onClose}
  ></button>

  <ResponsiveDialogDesktop {title} {description} {onClose}>
    {@render children?.()}
  </ResponsiveDialogDesktop>

  <ResponsiveDialogMobile {title} {onClose} footer={mobileFooter}>
    {@render children?.()}
  </ResponsiveDialogMobile>
{/if}
