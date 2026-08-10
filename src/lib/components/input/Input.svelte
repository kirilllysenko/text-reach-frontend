<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ClassValue, HTMLInputAttributes } from "svelte/elements";

  interface Props extends Omit<HTMLInputAttributes, "class"> {
    class?: ClassValue | null;
    error?: string | null;
    leftAddon?: Snippet;
    loading?: boolean;
    rightAddon?: Snippet;
  }

  let { value = $bindable(), error, leftAddon, loading = false, rightAddon, ...inputProps }: Props = $props();
</script>

<div
  aria-busy={loading}
  class={[
    `flex w-full items-center rounded-[1.05rem] bg-white/70
    shadow-[inset_0px_0px_7px_3px_rgba(30,41,59,0.1)] transition-[box-shadow,background-color]
    duration-200
    focus-within:ring-2 focus-within:ring-sky-500/25`,
    loading && "skeleton-loading",
    error && "ring-2 ring-rose-500/25 focus-within:ring-rose-500/25",
    inputProps.disabled && "cursor-not-allowed opacity-70",
    inputProps.class,
  ]}
>
  {#if leftAddon}
    <div class={["shrink-0 pl-3 transition-opacity duration-200", loading && "opacity-0"]}>
      {@render leftAddon()}
    </div>
  {/if}

  <input
    {...inputProps}
    bind:value
    aria-invalid={!!error}
    disabled={loading || inputProps.disabled}
    class={[
      `min-w-0 grow appearance-none border-none bg-transparent px-3 py-2 text-slate-700
      transition-opacity duration-200 placeholder:text-slate-400 focus:outline-none disabled:text-slate-500`,
      loading && "opacity-0",
      leftAddon && "pl-2",
      rightAddon && "pr-2",
    ]}
  />

  {#if rightAddon}
    <div class={["shrink-0 pr-1 transition-opacity duration-200", loading && "opacity-0"]}>
      {@render rightAddon()}
    </div>
  {/if}
</div>
