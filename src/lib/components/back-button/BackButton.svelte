<script lang="ts">
  import type { ClassValue, HTMLAnchorAttributes } from "svelte/elements";

  interface Props extends Omit<HTMLAnchorAttributes, "class"> {
    class?: ClassValue | null;
  }

  let { children, ...anchorProps }: Props = $props();
</script>

<a
  {...anchorProps}
  class={[
    `flex h-9 items-center justify-center rounded-xl border border-white/80 bg-white/80 px-3
      text-base font-medium text-slate-700 shadow-sm backdrop-blur-sm hover:bg-white`,
    anchorProps.class,
  ]}
>
  {#if children}
    {@render children()}
  {:else}
    Back
  {/if}
</a>
