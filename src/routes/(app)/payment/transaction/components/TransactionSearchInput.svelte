<script lang="ts">
  import { onDestroy } from "svelte";
  import { Input, type DatagridCore } from "$lib";
  import type { WalletTransactionViewModel } from "$lib/feature/payment/payment-view-data";
  import { debounce } from "$lib/utils/debounce";

  interface Props {
    dataLoading: Pick<DatagridCore<WalletTransactionViewModel>["handlers"]["dataLoading"], "reload">;
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
  placeholder="Search transaction or source ID"
  {value}
  oninput={(event) => updateSearch(event.currentTarget.value)}
/>
