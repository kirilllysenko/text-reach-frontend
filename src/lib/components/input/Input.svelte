<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ClassValue, HTMLInputAttributes } from "svelte/elements";

  interface Props extends Omit<HTMLInputAttributes, "class"> {
    class?: ClassValue | null;
    error?: string | null;
    leftAddon?: Snippet;
    rightAddon?: Snippet;
  }

  let { value = $bindable(), error, leftAddon, rightAddon, ...inputProps }: Props = $props();
</script>

<div
  class={[
    `flex w-full items-center rounded-[1.05rem] bg-white/70
    shadow-[inset_0px_0px_7px_3px_rgba(30,41,59,0.1)] transition-[box-shadow,background-color]
    duration-200
    focus-within:ring-2 focus-within:ring-sky-500/25`,
    error && "ring-2 ring-rose-500/25 focus-within:ring-rose-500/25",
    inputProps.disabled && "cursor-not-allowed opacity-70",
    inputProps.class,
  ]}
>
  {#if leftAddon}
    <div class="shrink-0 pl-3">
      {@render leftAddon()}
    </div>
  {/if}

  <input
    {...inputProps}
    bind:value
    aria-invalid={!!error}
    class={[
      `min-w-0 grow appearance-none border-none bg-transparent px-3 py-2 text-slate-700
      placeholder:text-slate-400 focus:outline-none disabled:text-slate-500`,
      leftAddon && "pl-2",
      rightAddon && "pr-2",
    ]}
  />

  {#if rightAddon}
    <div class="shrink-0 pr-1">
      {@render rightAddon()}
    </div>
  {/if}
</div>
