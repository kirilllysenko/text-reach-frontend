<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  interface Props {
    class?: ClassValue;
  }

  let { class: className }: Props = $props();
</script>

<svg class={className} viewBox="0 0 24 24" aria-hidden="true">
  <path d="M3 5h18l-7 8v5l-4 2v-7L3 5z" />
</svg>
