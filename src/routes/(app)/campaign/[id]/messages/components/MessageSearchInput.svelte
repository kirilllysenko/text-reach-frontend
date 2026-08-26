<script lang="ts">
  import { onDestroy } from "svelte";
  import { Input } from "$lib";
  import type { FormValue } from "text-reach-frontend-library/form";
  import { debounce } from "$lib/utils/debounce";

  interface Props {
    dataLoading: { reload: (reason: "search") => Promise<unknown> };
    field: FormValue<string>;
  }

  const SEARCH_DEBOUNCE_MS = 250;

  let { dataLoading, field = $bindable() }: Props = $props();

  const reloadSearch = debounce(() => {
    void dataLoading.reload("search");
  }, SEARCH_DEBOUNCE_MS);

  function updateSearch(search: string): void {
    field.value = search;
    reloadSearch();
  }

  onDestroy(() => {
    reloadSearch.cancel();
  });
</script>

<Input
  id="filter-field"
  class="min-w-0 grow"
  placeholder="Search message text or tenant phone"
  {field}
  oninput={(event) => updateSearch(event.currentTarget.value)}
/>
