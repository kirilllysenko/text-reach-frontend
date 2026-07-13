<script lang="ts">
  import { Card, Table, type DatagridCore } from "$lib";
  import type { MessageViewModel } from "$lib/feature/message/message-view-data";

  interface Props {
    table: DatagridCore<MessageViewModel>;
  }

  let { table }: Props = $props();
</script>

<Card variant="table">
  <Table {table} loading={table.features.dataLoading.loading} error={table.features.dataLoading.error} />
</Card>
