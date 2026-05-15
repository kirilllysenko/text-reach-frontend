<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { slide } from "svelte/transition";

  interface Props extends HTMLAttributes<HTMLParagraphElement> {
    error: string | null;
  }

  let { error, ...errorProps }: Props = $props();
</script>

{#if error}
  <p
    {...errorProps}
    aria-live="polite"
    transition:slide={{ duration: 180 }}
    class={["text-sm text-rose-600", errorProps.class]}
  >
    {error}
  </p>
{/if}
