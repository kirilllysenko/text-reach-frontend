<script lang="ts">
  import type { ContactFilterInput } from "$houdini/graphql/inputs";
  import { onDestroy } from "svelte";
  import { Input, type FilteringService } from "$lib";
  import { debounce } from "$lib/utils/debounce";

  interface Props {
    filtering: FilteringService<ContactFilterInput>;
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

    filtering.setFilterValue("search", normalizedSearch, "CONTAINS");
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
  id="filter-field"
  class="min-w-0 grow"
  placeholder="Search contacts"
  {value}
  oninput={(event) => updateSearch(event.currentTarget.value)}
/>
