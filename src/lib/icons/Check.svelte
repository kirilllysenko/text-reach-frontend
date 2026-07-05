<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  interface Props {
    class?: ClassValue;
  }

  let { class: className }: Props = $props();
</script>

<svg class={className} viewBox="0 0 24 24" aria-hidden="true">
  <path d="M9.2 16.6 4.8 12.2l1.4-1.4 3 3 8.6-8.6 1.4 1.4z" />
</svg>
