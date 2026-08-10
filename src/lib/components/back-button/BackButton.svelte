<script lang="ts">
  import type { ComponentProps } from "svelte";
  import Button from "../button/Button.svelte";

  interface Props extends Omit<ComponentProps<typeof Button>, "onclick" | "variant"> {}

  let { children, ...buttonProps }: Props = $props();
</script>

<Button {...buttonProps} variant="secondary" onclick={() => window.history.back()}>
  {#if children}
    {@render children()}
  {:else}
    Back
  {/if}
</Button>
