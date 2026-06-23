<script lang="ts" generics="TData, TMeta">
  import type { RenderedTable } from "./core/rendered-table";
  import type { DataTableColumn } from "./core/columns";

  interface Props {
    column: DataTableColumn<TData, TMeta>;
    view: RenderedTable<TData, TMeta>;
  }

  let { column, view }: Props = $props();
</script>

<div class="flex items-center gap-1">
  {#if column.sortable && view.actions.clearSort}
    <button
      class="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700"
      type="button"
      aria-label={`Clear ${column.header} sort`}
      onclick={(event) => {
        event.stopPropagation();
        view.actions.clearSort?.(column.id);
      }}
    >
      ×
    </button>
  {/if}

  {#if column.moveable !== false && view.actions.moveColumn}
    <button
      class="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700"
      type="button"
      aria-label={`Move ${column.header} left`}
      onclick={(event) => {
        event.stopPropagation();
        view.actions.moveColumn?.(column.id, "left");
      }}
    >
      ‹
    </button>
    <button
      class="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700"
      type="button"
      aria-label={`Move ${column.header} right`}
      onclick={(event) => {
        event.stopPropagation();
        view.actions.moveColumn?.(column.id, "right");
      }}
    >
      ›
    </button>
  {/if}

  {#if column.hideable !== false && view.actions.toggleColumnVisibility}
    <button
      class="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700"
      type="button"
      aria-label={`Hide ${column.header}`}
      onclick={(event) => {
        event.stopPropagation();
        view.actions.toggleColumnVisibility?.(column.id);
      }}
    >
      ◐
    </button>
  {/if}
</div>
