<script lang="ts">
  import { onDestroy } from "svelte";
  import { Input } from "$lib";
  import { debounce } from "$lib/utils/debounce";

  interface Props {
    search: { updateSearchQuery: (query: string) => void };
    value: string;
  }

  const SEARCH_DEBOUNCE_MS = 150;

  let { search, value = $bindable("") }: Props = $props();

  const updateTableSearch = debounce((query: string) => {
    search.updateSearchQuery(query.trim());
  }, SEARCH_DEBOUNCE_MS);

  function updateSearch(query: string): void {
    value = query;
    updateTableSearch(query);
  }

  onDestroy(() => {
    updateTableSearch.cancel();
  });
</script>

<Input
  id="filter-field"
  class="min-w-0 grow"
  placeholder="Search users"
  {value}
  oninput={(event) => updateSearch(event.currentTarget.value)}
/>
