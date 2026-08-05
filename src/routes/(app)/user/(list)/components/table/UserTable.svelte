<script lang="ts">
  import { Card, Table, type DatagridCore } from "$lib";
  import type { UserViewModel } from "$lib/feature/user/user-view-data";

  interface Props {
    table: DatagridCore<UserViewModel>;
    error?: string | null;
    loading?: boolean;
  }

  let { table, error = null, loading = false }: Props = $props();
</script>

<Card variant="table">
  <Table {table} {loading} {error} />
</Card>
