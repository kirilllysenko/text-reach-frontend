<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    activeFilterChips: string[];
    title: string;
    description: string;
    clearLabel?: string;
    compact?: boolean;
    onClear: () => void;
    children?: Snippet;
  }

  let {
    activeFilterChips,
    title,
    description,
    clearLabel = "Clear filters",
    compact = false,
    onClear,
    children,
  }: Props = $props();
</script>

<div
  class={[
    `space-y-3 rounded-xl border border-white/80 bg-white/80 p-3 shadow-sm backdrop-blur-sm`,
    compact && "text-sm",
  ]}
>
  <div class="flex items-center justify-between gap-3">
    <div>
      <h3 class="text-sm font-semibold text-slate-700">{title}</h3>
      <p class="text-xs text-slate-500">{description}</p>
    </div>

    <button
      class="text-xs font-medium text-sky-700 hover:cursor-pointer hover:underline"
      type="button"
      onclick={onClear}
    >
      {clearLabel}
    </button>
  </div>

  {#if activeFilterChips.length > 0}
    <div class="flex flex-wrap gap-2">
      {#each activeFilterChips as chip (chip)}
        <span class="rounded-full border border-white/80 bg-white/90 px-2.5 py-1 text-xs text-slate-700">
          {chip}
        </span>
      {/each}
    </div>
  {/if}

  {@render children?.()}
</div>
