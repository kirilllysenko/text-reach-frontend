<script lang="ts">
  import type { Snippet } from "svelte";
  import Dialog from "../dialog/Dialog.svelte";

  interface Props {
    title: string;
    description?: string;
    onClose: () => void;
    children?: Snippet;
  }

  let { title, description, onClose, children }: Props = $props();
</script>

<div class="fixed inset-0 z-50 hidden items-center justify-center p-4 sm:flex sm:p-6">
  <Dialog
    class="max-h-[min(56rem,calc(100dvh-3rem))] w-full max-w-4xl overflow-hidden p-0
      sm:w-full lg:max-w-5xl xl:max-w-6xl"
    role="dialog"
    aria-modal="true"
    aria-label={title}
  >
    <section class="flex max-h-[min(56rem,calc(100dvh-3rem))] flex-col">
      <header class="flex items-start justify-between gap-4 border-b border-white/70 px-5 py-4 sm:px-6">
        <div class="space-y-1">
          <h2 class="text-lg font-semibold text-slate-800">{title}</h2>
          {#if description}
            <p class="text-sm text-slate-500">{description}</p>
          {/if}
        </div>

        <button
          class="shrink-0 rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-sm text-slate-700
            shadow-sm hover:cursor-pointer hover:bg-white"
          type="button"
          onclick={onClose}
        >
          Close
        </button>
      </header>

      <div class="min-h-0 overflow-y-auto p-5 sm:p-6">
        {@render children?.()}
      </div>
    </section>
  </Dialog>
</div>
