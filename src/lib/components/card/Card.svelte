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
  class={[
    `mt-10 rounded-2xl border border-white/80 bg-white/75 p-4 shadow-[0_20px_45px_-25px_rgba(30,41,59,0.45)]
    backdrop-blur-md sm:mx-auto sm:w-md sm:p-6`,
    divProps.class,
  ]}
  {...divProps}
>
  {@render children?.()}
</div>
