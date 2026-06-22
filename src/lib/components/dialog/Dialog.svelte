<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  let { children, class: propClass, ...divProps }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div
  {...divProps}
  class={[
    `w-dvw border border-white/80 bg-white/85
      p-4 text-slate-800 shadow-2xl
      backdrop-blur-md sm:w-md sm:rounded-2xl sm:p-6`,
    propClass,
  ]}
>
  {@render children?.()}
</div>
