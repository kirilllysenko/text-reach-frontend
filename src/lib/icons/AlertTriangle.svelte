<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  interface Props {
    class?: ClassValue;
  }

  let { class: className }: Props = $props();
</script>

<svg class={className} viewBox="0 0 24 24" aria-hidden="true">
  <path d="M12 2 1 21h22L12 2zm1 15h-2v-2h2v2zm0-4h-2V9h2v4z" />
</svg>
