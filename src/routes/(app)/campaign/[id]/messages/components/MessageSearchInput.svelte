<script lang="ts">
  import { onDestroy } from "svelte";
  import { Input } from "$lib";
  import { debounce } from "$lib/utils/debounce";

  interface Props {
    dataLoading: { reload: (reason: "search") => Promise<unknown> };
    value: string;
  }

  const SEARCH_DEBOUNCE_MS = 250;

  let { dataLoading, value = $bindable("") }: Props = $props();

  const reloadSearch = debounce(() => {
    void dataLoading.reload("search");
  }, SEARCH_DEBOUNCE_MS);

  function updateSearch(search: string): void {
    value = search;
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
  {value}
  oninput={(event) => updateSearch(event.currentTarget.value)}
/>
