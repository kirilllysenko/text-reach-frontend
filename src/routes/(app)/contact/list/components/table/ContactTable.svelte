<script lang="ts">
  import { Card, Table } from "$lib";
  import { table } from "./table.svelte";
</script>

<Card variant="table">
  <Table {table} loading={table.features.dataLoading.loading} error={table.features.dataLoading.error} />
</Card>
