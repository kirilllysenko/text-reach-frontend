<script lang="ts">
  import type { DataTableSortDirection, SortingFeature } from "../table";

  interface SortFieldOption {
    value: string;
    label: string;
  }

  interface Props {
    sorting: SortingFeature;
    fieldOptions: SortFieldOption[];
    compact?: boolean;
    directionOptions?: Exclude<DataTableSortDirection, "intermediate">[];
  }

  let { sorting, fieldOptions, compact = false, directionOptions = ["ascending", "descending"] }: Props = $props();

  const chips = $derived.by(() =>
    sorting.sorts.map((sort, index) => `#${index + 1} ${getFieldLabel(sort.sortId)} ${sort.direction}`),
  );

  function addRule(): void {
    const usedFields = new Set(sorting.sorts.map((sort) => sort.sortId));
    const field = fieldOptions.find((option) => !usedFields.has(option.value)) ?? fieldOptions[0];

    if (field) {
      sorting.add(field.value);
    }
  }

  function getFieldLabel(sortId: string): string {
    return fieldOptions.find((field) => field.value === sortId)?.label ?? sortId;
  }
</script>

<div
  class={[
    `space-y-3 rounded-xl border border-white/80 bg-white/80 p-3 shadow-sm backdrop-blur-sm`,
    compact && "text-sm",
  ]}
>
  <div class="flex items-center justify-between gap-3">
    <div>
      <h3 class="text-sm font-semibold text-slate-700">Sort priority stack</h3>
      <p class="text-xs text-slate-500">Earlier rules win</p>
    </div>

    <button
      class="text-xs font-medium text-sky-700 hover:cursor-pointer hover:underline"
      type="button"
      onclick={() => sorting.clear()}
    >
      Reset
    </button>
  </div>

  {#if chips.length > 0}
    <div class="flex flex-wrap gap-2">
      {#each chips as chip (chip)}
        <span class="rounded-full border border-white/80 bg-white/90 px-2.5 py-1 text-xs text-slate-700">
          {chip}
        </span>
      {/each}
    </div>
  {/if}

  <div class="space-y-2">
    {#each sorting.sorts as rule, index (`${rule.sortId}-${index}`)}
      <div
        class="grid grid-cols-[minmax(0,1fr)_7rem_auto] items-center gap-2 rounded-xl border border-white/80
          bg-white/75 p-2"
      >
        <select
          class="rounded-xl border border-white/80 bg-white/90 px-3 py-2 text-sm text-slate-700"
          value={rule.sortId}
          onchange={(event) => sorting.updateSortId(index, event.currentTarget.value)}
        >
          {#each fieldOptions as field (field.value)}
            <option value={field.value}>{field.label}</option>
          {/each}
        </select>

        <select
          class="rounded-xl border border-white/80 bg-white/90 px-3 py-2 text-sm text-slate-700"
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
          class="rounded-xl border border-white/80 bg-white/90 px-3 py-2 text-sm text-slate-700 shadow-sm
            hover:cursor-pointer hover:bg-white"
          type="button"
          disabled={sorting.sorts.length <= 1}
          onclick={() => sorting.removeAt(index)}
        >
          Remove
        </button>
      </div>
    {/each}
  </div>

  <button
    class="rounded-xl border border-white/80 bg-white/90 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm
      hover:cursor-pointer hover:bg-white"
    type="button"
    onclick={addRule}
  >
    Add sort rule
  </button>
</div>
