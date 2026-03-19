<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class'> {
    class?: string;
    children?: Snippet;
  }

  let { children, ...divProps }: Props = $props();
</script>

<div
  {...divProps}
  class={[
    `bg-white/85 backdrop-blur-md border border-white/80
      sm:rounded-2xl sm:p-6 sm:w-md
      p-4 w-dvw shadow-2xl text-slate-800`,
    divProps.class,
  ]}
>
  {@render children?.()}
</div>
