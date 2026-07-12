<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { Card, Table, type DatagridCore } from "$lib";
  import type { ContactGroupViewModel } from "$lib/feature/contact-group/contact-group-view-data";

  interface Props {
    table: DatagridCore<ContactGroupViewModel>;
  }

  let { table }: Props = $props();

  onMount(() => {
    table.handlers.dataLoading.start();
  });

  onDestroy(() => {
    table.handlers.dataLoading.dispose();
  });
</script>

<Card variant="table">
  <Table {table} loading={table.features.dataLoading.loading} error={table.features.dataLoading.error} />
</Card>
