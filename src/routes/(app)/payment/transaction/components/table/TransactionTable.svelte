<script lang="ts">
  import { Card, Table, type DatagridCore } from "$lib";
  import type { WalletTransactionViewModel } from "$lib/feature/payment/payment-view-data";

  interface Props {
    table: DatagridCore<WalletTransactionViewModel>;
  }

  let { table }: Props = $props();
</script>

<Card variant="table">
  <Table {table} loading={table.features.dataLoading.loading} error={table.features.dataLoading.error} />
</Card>
