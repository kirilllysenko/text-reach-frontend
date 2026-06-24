<script lang="ts" generics="TData, TMeta">
  import { onDestroy, onMount } from "svelte";
  import { createRenderedTable } from "./core/rendered-table";
  import type { RenderableTable } from "./core/rendered-table";
  import TableBody from "./TableBody.svelte";
  import TableHeader from "./TableHeader.svelte";
  import TableStatus from "./TableStatus.svelte";

  interface Props {
    table: RenderableTable<TData, TMeta>;
  }

  let { table }: Props = $props();
  const view = $derived(createRenderedTable(table));

  onMount(() => {
    void view.actions.loadInitial();
  });

  onDestroy(() => table.dispose());
</script>

<div class="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
  <TableHeader {view} />
  <TableBody {view} />
  <TableStatus {view} />
</div>
