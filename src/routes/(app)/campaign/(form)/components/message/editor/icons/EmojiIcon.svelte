<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  let { class: className }: { class?: ClassValue } = $props();
</script>

<svg class={className} viewBox="0 0 24 24" aria-hidden="true">
  <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" />
  <path
    d="M8 9.5a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Zm8 0A1.25 1.25 0 1 0 16 7a1.25 1.25 0 0 0 0 2.5ZM7.5 13h9a4.8 4.8 0 0 1-9 0Z"
  />
</svg>
