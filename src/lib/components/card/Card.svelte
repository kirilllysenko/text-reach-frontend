<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  let { children, class: propClass, ...divProps }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div
  {...divProps}
  class={[
    `mt-10 rounded-2xl border border-white/80 bg-white/75 p-4 shadow-[0_20px_45px_-25px_rgba(30,41,59,0.45)]
    backdrop-blur-md sm:mx-auto sm:w-md sm:p-6`,
    propClass,
  ]}
>
  {@render children?.()}
</div>
