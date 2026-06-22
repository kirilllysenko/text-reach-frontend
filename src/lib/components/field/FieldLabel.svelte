<script lang="ts">
  import type { HTMLLabelAttributes } from "svelte/elements";

  let { children, ...labelProps }: HTMLLabelAttributes = $props();
</script>

<label {...labelProps} class={["block text-sm font-medium text-slate-700", labelProps.class]}>
  {@render children?.()}
</label>
