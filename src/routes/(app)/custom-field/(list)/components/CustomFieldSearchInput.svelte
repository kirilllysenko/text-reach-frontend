<script lang="ts">
  import { onDestroy } from "svelte";
  import { Input, type DatagridCore } from "$lib";
  import type { CustomFieldViewModel } from "$lib/feature/custom-field/custom-field-view-data";
  import { debounce } from "$lib/utils/debounce";

  interface Props {
    dataLoading: Pick<DatagridCore<CustomFieldViewModel>["handlers"]["dataLoading"], "reload">;
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
  class="min-w-0 grow"
  placeholder="Search custom fields"
  {value}
  oninput={(event) => updateSearch(event.currentTarget.value)}
/>
