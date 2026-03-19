<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  interface Props extends HTMLInputAttributes {
    error?: string | null;
  }

  let { value = $bindable(), error, ...inputProps }: Props = $props();
</script>

<input
  {...inputProps}
  bind:value={value}
  aria-invalid={!!error}
  class={[
    `block w-full rounded-xl border bg-white/80 px-3 py-2 text-slate-700
    focus:outline-none focus:ring-2 focus:ring-sky-500/60`,
    error ? 'border-rose-300' : 'border-white/80',
    inputProps.class,
  ]}
/>
