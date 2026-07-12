<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { Card, Table } from "$lib";
  import { table } from "./table.svelte";

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
