<script lang="ts">
  import { onDestroy } from "svelte";
  import { Input } from "$lib";
  import { debounce } from "$lib/utils/debounce";
  import { table } from "./table/table.svelte";

  interface Props {
    value: string;
  }

  const SEARCH_DEBOUNCE_MS = 250;

  let { value = $bindable("") }: Props = $props();

  const updateSearchFilter = debounce((search: string) => {
    const normalizedSearch = search.trim();

    if (!normalizedSearch) {
      table.handlers.filtering.removeFilter("search");
      return;
    }

    table.handlers.filtering.setFilter("search", {
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
