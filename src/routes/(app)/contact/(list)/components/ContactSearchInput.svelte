<script lang="ts">
  import { onDestroy } from "svelte";
  import { Input, type FilteringService } from "$lib";
  import { debounce } from "$lib/utils/debounce";

  interface Props {
    filtering: FilteringService;
    value: string;
  }

  const SEARCH_DEBOUNCE_MS = 250;

  let { filtering, value = $bindable("") }: Props = $props();

  const updateSearchFilter = debounce((search: string) => {
    const normalizedSearch = search.trim();

    if (!normalizedSearch) {
      filtering.removeFilter("search");
      return;
    }

    filtering.setFilter("search", {
      filterId: "search",
      operator: "CONTAINS",
      type: "text",
      value: normalizedSearch,
    });
  }, SEARCH_DEBOUNCE_MS);

  function updateSearch(search: string): void {
    value = search;
    updateSearchFilter(search);
  }

  onDestroy(() => {
    updateSearchFilter.cancel();
  });
</script>

<Input
  class="min-w-0 grow"
  placeholder="Search contacts"
  {value}
  oninput={(event) => updateSearch(event.currentTarget.value)}
/>
