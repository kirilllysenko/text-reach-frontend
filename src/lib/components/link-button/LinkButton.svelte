<script lang="ts">
  import type { ClassValue, HTMLAnchorAttributes } from "svelte/elements";

  interface Props extends Omit<HTMLAnchorAttributes, "class"> {
    class?: ClassValue | null;
  }

  let { children, ...anchorProps }: Props = $props();
</script>

<a
  {...anchorProps}
  class={[
    `flex h-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-700 px-3
      text-base font-medium text-white shadow-sm hover:bg-slate-800`,
    anchorProps.class,
  ]}
>
  {@render children?.()}
</a>
