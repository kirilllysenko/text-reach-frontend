<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    title: string;
    onClose: () => void;
    children?: Snippet;
    footer?: Snippet;
  }

  let { title, onClose, children, footer }: Props = $props();
</script>

<div
  class="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] rounded-t-[1.75rem] border border-white/80 bg-white/88
    p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-20px_45px_-25px_rgba(30,41,59,0.55)]
    backdrop-blur-md sm:hidden"
  role="dialog"
  aria-modal="true"
  aria-label={title}
>
  <header class="mb-4 flex items-center justify-between gap-3">
    <h3 class="text-base font-semibold text-slate-800">{title}</h3>

    <button
      class="rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-sm text-slate-700 shadow-sm
        hover:cursor-pointer hover:bg-white"
      type="button"
      onclick={onClose}
    >
      Close
    </button>
  </header>

  <div class="max-h-[58dvh] overflow-y-auto">
    {@render children?.()}
  </div>

  {#if footer}
    <div class="mt-4">
      {@render footer()}
    </div>
  {/if}
</div>
