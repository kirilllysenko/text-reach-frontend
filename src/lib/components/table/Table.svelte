<script lang="ts" generics="TData, TMeta">
  import { onDestroy, onMount } from "svelte";
  import type { DataTable } from "./core/data-table.svelte";
  import TableBody from "./TableBody.svelte";
  import TableHeader from "./TableHeader.svelte";
  import TableStatus from "./TableStatus.svelte";

  interface Props {
    table: DataTable<TData, TMeta>;
  }

  let { table }: Props = $props();

  onMount(() => {
    void table.loadInitial();
  });

  onDestroy(() => table.dispose());
</script>

<div class="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
  <TableHeader {table} />
  <TableBody {table} />
  <TableStatus {table} />
</div>
