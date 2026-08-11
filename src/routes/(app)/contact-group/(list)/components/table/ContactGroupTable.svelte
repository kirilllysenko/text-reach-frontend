<script lang="ts">
  import type { ContactGroupSortByInput } from "$houdini/graphql/inputs";
  import { Card, Table, type DatagridCore } from "$lib";
  import type { ContactGroupViewModel } from "$lib/feature/contact-group/contact-group-view-data";

  interface Props {
    table: DatagridCore<ContactGroupViewModel, ContactGroupSortByInput>;
  }

  let { table }: Props = $props();
</script>

<Card variant="table">
  <Table {table} loading={table.features.dataLoading.loading} error={table.features.dataLoading.error} />
</Card>
