<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "class"> {
    class?: string;
    children?: Snippet;
  }

  let { children, ...divProps }: Props = $props();
</script>

<div
  {...divProps}
  class={[
    `w-dvw border border-white/80 bg-white/85
      p-4 text-slate-800 shadow-2xl
      backdrop-blur-md sm:w-md sm:rounded-2xl sm:p-6`,
    divProps.class,
  ]}
>
  {@render children?.()}
</div>
