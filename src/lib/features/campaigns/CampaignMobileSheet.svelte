<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    open: boolean;
    title: string;
    onClose: () => void;
    actions?: Snippet;
    children?: Snippet;
    footer?: Snippet;
  }

  let { open, title, onClose, actions, children, footer }: Props = $props();
</script>

{#if open}
  <button
    class="fixed inset-0 z-40 bg-slate-900/35 backdrop-blur-[1px]"
    type="button"
    aria-label={`Close ${title}`}
    onclick={onClose}
  ></button>

  <section
    class="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] rounded-t-[1.75rem] border border-white/80 bg-white/88
      p-4 shadow-[0_-20px_45px_-25px_rgba(30,41,59,0.55)] backdrop-blur-md"
  >
    <header class="mb-4 flex items-center justify-between gap-3">
      <div>
        <h3 class="text-base font-semibold text-slate-800">{title}</h3>
      </div>

      <div class="flex items-center gap-3">
        {@render actions?.()}
        <button
          class="rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-sm text-slate-700 shadow-sm
            hover:cursor-pointer hover:bg-white"
          type="button"
          onclick={onClose}
        >
          Close
        </button>
      </div>
    </header>

    <div class="max-h-[58dvh] overflow-y-auto">
      {@render children?.()}
    </div>

    {#if footer}
      <div class="mt-4">
        {@render footer()}
      </div>
    {/if}
  </section>
{/if}
