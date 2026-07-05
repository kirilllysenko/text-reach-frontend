<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  interface Props {
    class?: ClassValue;
  }

  let { class: className }: Props = $props();
</script>

<svg class={className} viewBox="0 0 24 24" aria-hidden="true">
  <circle class="opacity-20" cx="12" cy="12" r="9" stroke-width="3" />
  <path class="opacity-90" d="M21 12a9 9 0 0 0-9-9" stroke-width="3" stroke-linecap="round" />
</svg>
