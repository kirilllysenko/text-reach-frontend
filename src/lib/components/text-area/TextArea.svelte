<script lang="ts">
  import type { ClassValue, HTMLTextareaAttributes } from "svelte/elements";

  interface Props extends Omit<HTMLTextareaAttributes, "class"> {
    class?: ClassValue | null;
    loading?: boolean;
  }

  let { value = $bindable(), loading = false, ...textareaProps }: Props = $props();
</script>

<textarea
  {...textareaProps}
  bind:value
  aria-busy={loading}
  disabled={loading || textareaProps.disabled}
  class={[
    `min-h-24 w-full resize-y rounded-[1.05rem] border-none bg-white/70 px-3 py-2 text-slate-700
    shadow-[inset_0px_0px_7px_3px_rgba(30,41,59,0.1)] transition-[box-shadow,background-color,color]
    duration-200 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500/25 focus:outline-none`,
    loading && "skeleton-loading text-transparent placeholder:text-transparent",
    textareaProps.class,
  ]}
></textarea>
