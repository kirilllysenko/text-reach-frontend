<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  let { class: className }: { class?: ClassValue } = $props();
</script>

<svg class={className} viewBox="0 0 24 24" aria-hidden="true">
  <path
    d="M19 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm0 16H5v-3l3.5-3.5 2.5 2.5 2.5-2.5L19 18v1ZM15.5 10A1.5 1.5 0 1 1 15.5 7a1.5 1.5 0 0 1 0 3Z"
  />
</svg>
