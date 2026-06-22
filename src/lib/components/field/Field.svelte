<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  let { children, ...fieldProps }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div {...fieldProps} class={["space-y-1", fieldProps.class]}>
  {@render children?.()}
</div>
