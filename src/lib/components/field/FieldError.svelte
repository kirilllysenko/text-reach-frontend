<script lang="ts">
  import type {HTMLAttributes} from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLParagraphElement> {
    error: string | null;
  }

  let { error, children, ...errorProps }: Props = $props();

</script>

{#if error}
  <p {...errorProps} class={['text-sm text-rose-600', errorProps.class]}>
    {#if children}
      {@render children()}
    {:else}
      {error}
    {/if}
  </p>
{/if}
