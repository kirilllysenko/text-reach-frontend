<script lang="ts">
  import { onDestroy } from "svelte";
  import { Input } from "$lib";
  import { debounce } from "$lib/utils/debounce";

  interface Props {
    onSearchChange: (search: string) => void;
    value: string;
  }

  const SEARCH_DEBOUNCE_MS = 250;

  let { onSearchChange, value = $bindable("") }: Props = $props();

  const debouncedSearchChange = debounce((search: string) => {
    onSearchChange(search);
  }, SEARCH_DEBOUNCE_MS);

  function updateSearch(search: string): void {
    value = search;
    debouncedSearchChange(search);
  }

  onDestroy(() => {
    debouncedSearchChange.cancel();
  });
</script>

<Input
  class="min-w-0 grow"
  placeholder="Search contacts"
  {value}
  oninput={(event) => updateSearch(event.currentTarget.value)}
/>
