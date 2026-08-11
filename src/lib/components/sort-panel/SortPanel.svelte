<script lang="ts" generics="TSort">
  import Plus from "$lib/icons/Plus.svelte";
  import Trash from "$lib/icons/Trash.svelte";
  import type { DataTableActiveSortDirection, SortingService } from "../table";

  interface Props {
    sorting: SortingService<TSort>;
  }

  let { sorting }: Props = $props();

  const fieldOptions = $derived(
    sorting.sortDefinitions.map((definition) => ({
      label: definition.label ?? definition.sortId,
      value: definition.sortId,
    })),
  );
  const directionOptions = [
    { label: "Ascending", value: "ascending" },
    { label: "Descending", value: "descending" },
  ] satisfies { label: string; value: DataTableActiveSortDirection }[];

  function addRule(): void {
    const usedFields = new Set(sorting.sorts.map((sort) => sorting.getSortId(sort)));
    const field = fieldOptions.find((option) => !usedFields.has(option.value)) ?? fieldOptions[0];

    if (field) {
      sorting.addSort(field.value);
    }
  }
</script>

<div class="space-y-3 text-sm">
  <div class="space-y-2">
    {#each sorting.sorts as rule, index (`${sorting.getSortId(rule)}-${index}`)}
      <div class="grid grid-cols-[1.75rem_minmax(0,1fr)_minmax(7.5rem,0.7fr)_2.5rem] items-center gap-2">
        <span class="flex size-7 items-center justify-center text-sm font-semibold text-slate-500">
          {index + 1}
        </span>

        <select
          class="min-w-0 rounded-xl border border-white/80 bg-white/90 px-3 py-2 text-sm text-slate-700 shadow-sm"
          value={sorting.getSortId(rule)}
          onchange={(event) => sorting.updateSortId(index, event.currentTarget.value)}
        >
          {#each fieldOptions as field (field.value)}
            <option value={field.value}>{field.label}</option>
          {/each}
        </select>

        <select
          class="min-w-0 rounded-xl border border-white/80 bg-white/90 px-3 py-2 text-sm text-slate-700 shadow-sm"
          value={sorting.getSortDirection(rule)}
          onchange={(event) =>
            sorting.updateSortDirection(index, event.currentTarget.value as DataTableActiveSortDirection)}
        >
          {#each directionOptions as direction (direction.value)}
            <option value={direction.value}>{direction.label}</option>
          {/each}
        </select>

        <button
          class="flex size-10 items-center justify-center rounded-xl border border-white/80 bg-white/90 text-slate-600
            shadow-sm hover:cursor-pointer hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          type="button"
          aria-label={`Remove sort rule ${index + 1}`}
          disabled={sorting.sorts.length <= 1}
          title="Remove sort rule"
          onclick={() => sorting.removeSortAt(index)}
        >
          <Trash class="size-4 fill-current" />
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
    <Plus class="size-4 fill-current" />
    Add sort rule
  </button>
</div>
