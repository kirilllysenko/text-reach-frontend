<script lang="ts">
  import type { ClassValue } from "svelte/elements";

  interface Props {
    class?: ClassValue;
  }

  let { class: className }: Props = $props();
</script>

<svg class={className} viewBox="0 0 24 24" aria-hidden="true">
  <path
    d="M3 6.5A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5v11A2.5 2.5 0 0 1
      18.5 20h-13A2.5 2.5 0 0 1 3 17.5v-11Zm2 2.25h14V6.5a.5.5 0 0 0-.5-.5h-13a.5.5
      0 0 0-.5.5v2.25Zm0 2v6.75a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-6.75H5Zm2.25
      4.5h4.5v1.5h-4.5v-1.5Zm0-2.5h7.5v1.5h-7.5v-1.5Z"
  />
</svg>
