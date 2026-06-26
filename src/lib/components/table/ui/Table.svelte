<script lang="ts" generics="TData">
  import type { DatagridCore } from "../core/index.svelte";
  import TableBody from "./TableBody.svelte";
  import TableHeader from "./TableHeader.svelte";
  import TableStatus from "./TableStatus.svelte";

  interface Props {
    table: DatagridCore<TData>;
    error?: string | null;
    loading?: boolean;
  }

  let { table, error = null, loading = false }: Props = $props();
</script>

<div class="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
  <TableHeader {table} />
  <TableBody {table} {error} {loading} />
  <TableStatus {table} />
</div>
