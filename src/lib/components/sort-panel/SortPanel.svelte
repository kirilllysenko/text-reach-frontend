<script lang="ts">
  import type { DataTableSort, DataTableSortDirection } from "../table";

  interface SortFieldOption {
    value: string;
    label: string;
  }

  export interface SortController {
    sorts: DataTableSort[];
    add: (sortId: string, direction?: Exclude<DataTableSortDirection, "intermediate">) => void;
    clear: () => void;
    removeAt: (index: number) => void;
    updateDirection: (index: number, direction: Exclude<DataTableSortDirection, "intermediate">) => void;
    updateSortId: (index: number, sortId: string) => void;
  }

  interface Props {
    sorting: SortController;
    fieldOptions: SortFieldOption[];
    compact?: boolean;
    directionOptions?: Exclude<DataTableSortDirection, "intermediate">[];
  }

  let { sorting, fieldOptions, compact = false, directionOptions = ["ascending", "descending"] }: Props = $props();

  function addRule(): void {
    const usedFields = new Set(sorting.sorts.map((sort) => sort.sortId));
    const field = fieldOptions.find((option) => !usedFields.has(option.value)) ?? fieldOptions[0];

    if (field) {
      sorting.add(field.value);
    }
  }
</script>

<div class={["space-y-3", compact && "text-sm"]}>
  <div class="space-y-2">
    {#each sorting.sorts as rule, index (`${rule.sortId}-${index}`)}
      <div class="grid grid-cols-[1.75rem_minmax(0,1fr)_minmax(7.5rem,0.7fr)_2.5rem] items-center gap-2">
        <span class="flex size-7 items-center justify-center text-sm font-semibold text-slate-500">
          {index + 1}
        </span>

        <select
          class="min-w-0 rounded-xl border border-white/80 bg-white/90 px-3 py-2 text-sm text-slate-700 shadow-sm"
          value={rule.sortId}
          onchange={(event) => sorting.updateSortId(index, event.currentTarget.value)}
        >
          {#each fieldOptions as field (field.value)}
            <option value={field.value}>{field.label}</option>
          {/each}
        </select>

        <select
          class="min-w-0 rounded-xl border border-white/80 bg-white/90 px-3 py-2 text-sm text-slate-700 shadow-sm"
          value={rule.direction}
          onchange={(event) =>
            sorting.updateDirection(
              index,
              event.currentTarget.value as Exclude<DataTableSortDirection, "intermediate">,
            )}
        >
          {#each directionOptions as direction (direction)}
            <option value={direction}>{direction}</option>
          {/each}
        </select>

        <button
          class="flex size-10 items-center justify-center rounded-xl border border-white/80 bg-white/90 text-slate-600
            shadow-sm hover:cursor-pointer hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          type="button"
          aria-label={`Remove sort rule ${index + 1}`}
          disabled={sorting.sorts.length <= 1}
          title="Remove sort rule"
          onclick={() => sorting.removeAt(index)}
        >
          <svg class="size-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 3h6l1 2h5v2H3V5h5l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9z" />
            <path d="M6 9h2v11h8V9h2v13H6V9z" />
          </svg>
        </button>
      </div>
    {/each}
  </div>

  <button
    class="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300
      bg-white/70 px-3 text-sm font-medium text-slate-700 shadow-sm hover:cursor-pointer hover:border-sky-300
      hover:bg-white"
    type="button"
    onclick={addRule}
  >
    <svg class="size-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5z" />
    </svg>
    Add sort rule
  </button>
</div>
