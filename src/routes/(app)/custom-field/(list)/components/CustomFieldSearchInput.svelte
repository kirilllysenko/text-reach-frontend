<script lang="ts">
  import { onDestroy } from "svelte";
  import { Input } from "$lib";
  import type { FormValue } from "text-reach-frontend-library/form";
  import { debounce } from "$lib/utils/debounce";

  interface Props {
    search: { updateSearchQuery: (query: string) => void };
    field: FormValue<string>;
  }

  const SEARCH_DEBOUNCE_MS = 250;

  let { search, field = $bindable() }: Props = $props();

  const updateTableSearch = debounce((query: string) => {
    search.updateSearchQuery(query.trim());
  }, SEARCH_DEBOUNCE_MS);

  function updateSearch(query: string): void {
    field.value = query;
    updateTableSearch(query);
  }

  onDestroy(() => {
    updateTableSearch.cancel();
  });
</script>

<Input
  id="filter-field"
  class="min-w-0 grow"
  placeholder="Search custom fields"
  {field}
  oninput={(event) => updateSearch(event.currentTarget.value)}
/>
