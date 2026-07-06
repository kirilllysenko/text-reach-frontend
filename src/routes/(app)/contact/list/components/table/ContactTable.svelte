<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { Table, type DatagridCore } from "$lib";
  import type { ContactViewModel } from "$lib/feature/contact/contact-view-data";

  interface Props {
    table: DatagridCore<ContactViewModel>;
  }

  let { table }: Props = $props();

  onMount(() => {
    table.handlers.dataLoading.start();
  });

  onDestroy(() => {
    table.handlers.dataLoading.dispose();
  });
</script>

<div
  class="flex min-h-0 grow flex-col overflow-hidden rounded-2xl border border-white/70 bg-white/70 p-0
    shadow-[0_20px_45px_-25px_rgba(30,41,59,0.45)] backdrop-blur-md"
>
  <Table {table} loading={table.features.dataLoading.loading} error={table.features.dataLoading.error} />
</div>
