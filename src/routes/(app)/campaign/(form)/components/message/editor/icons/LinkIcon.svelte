<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  let { class: className }: { class?: ClassValue } = $props();
</script>

<svg class={className} viewBox="0 0 24 24" aria-hidden="true">
  <path
    d="M10.6 13.4a1 1 0 0 1 0-1.4l2.8-2.8a3 3 0 1 1 4.2 4.2L15.8 15l1.4 1.4 1.8-1.8a5 5 0 0 0-7-7L9.2 10.6a1 1 0 0 1 1.4 0Z"
  />
  <path
    d="M13.4 10.6a1 1 0 0 1 0 1.4l-2.8 2.8a3 3 0 1 1-4.2-4.2L8.2 9 6.8 7.6 5 9.4a5 5 0 0 0 7 7l2.8-2.8a1 1 0 0 1-1.4-1.4Z"
  />
</svg>
