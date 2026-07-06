<script lang="ts">
  import { onDestroy } from "svelte";
  import { Input } from "$lib";

  interface Props {
    onSearchChange: (search: string) => void;
    value: string;
  }

  const SEARCH_DEBOUNCE_MS = 250;

  let { onSearchChange, value = $bindable("") }: Props = $props();
  let searchTimer: ReturnType<typeof setTimeout> | null = null;

  function updateSearch(search: string): void {
    value = search;

    if (searchTimer) {
      clearTimeout(searchTimer);
    }

    searchTimer = setTimeout(() => {
      onSearchChange(search);
    }, SEARCH_DEBOUNCE_MS);
  }

  onDestroy(() => {
    if (searchTimer) {
      clearTimeout(searchTimer);
    }
  });
</script>

<Input
  class="min-w-0 grow"
  placeholder="Search contacts"
  {value}
  oninput={(event) => updateSearch(event.currentTarget.value)}
/>
