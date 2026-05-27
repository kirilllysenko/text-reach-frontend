<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLDivElement> {}

  let { children, ...fieldProps }: Props = $props();
</script>

<div {...fieldProps} class={["space-y-1", fieldProps.class]}>
  {@render children?.()}
</div>
