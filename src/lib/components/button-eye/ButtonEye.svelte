<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";
  import EyeOff from "$lib/icons/EyeOff.svelte";
  import Eye from "$lib/icons/Eye.svelte";

  type Props = {
    off?: boolean;
  } & HTMLButtonAttributes;

  let { off = true, ...buttonProps }: Props = $props();
</script>

<button
  {...buttonProps}
  type="button"
  class={[
    `size-5 rounded-sm focus-visible:outline-2 focus-visible:outline-sky-500
    hover:cursor-pointer`,
    buttonProps.class,
  ]}
>
  {#if off}
    <EyeOff />
  {:else}
    <Eye />
  {/if}
</button>
