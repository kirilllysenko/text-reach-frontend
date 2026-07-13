<script lang="ts">
  import { Card, Table, type DatagridCore } from "$lib";
  import type { CustomFieldViewModel } from "$lib/feature/custom-field/custom-field-view-data";

  interface Props {
    table: DatagridCore<CustomFieldViewModel>;
  }

  let { table }: Props = $props();
</script>

<Card variant="table">
  <Table {table} loading={table.features.dataLoading.loading} error={table.features.dataLoading.error} />
</Card>
