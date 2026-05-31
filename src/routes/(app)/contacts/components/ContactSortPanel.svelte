<script lang="ts">
  import type { SortDirection } from "$lib/api/index.schemas";
  import {
    contactSortFieldLabelMap,
    type ContactSortField,
    type ContactSortRule,
  } from "$lib/features/contacts/contacts-view-data";

  interface Props {
    sortRules: ContactSortRule[];
    sortFieldOptions: ContactSortField[];
    sortChips: string[];
    compact?: boolean;
    onAddRule: () => void;
    onRemoveRule: (ruleId: string) => void;
    onFieldChange: (ruleId: string, field: ContactSortField) => void;
    onDirectionChange: (ruleId: string, direction: SortDirection) => void;
    onReset: () => void;
  }

  let {
    sortRules,
    sortFieldOptions,
    sortChips,
    compact = false,
    onAddRule,
    onRemoveRule,
    onFieldChange,
    onDirectionChange,
    onReset,
  }: Props = $props();
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
      onclick={onReset}
    >
      Reset
    </button>
  </div>

  <div class="flex flex-wrap gap-2">
    {#each sortChips as chip (chip)}
      <span class="rounded-full border border-white/80 bg-white/90 px-2.5 py-1 text-xs text-slate-700">
        {chip}
      </span>
    {/each}
  </div>

  <div class="space-y-2">
    {#each sortRules as rule (rule.id)}
      <div
        class="grid grid-cols-[minmax(0,1fr)_7rem_auto] items-center gap-2 rounded-xl border border-white/80
          bg-white/75 p-2"
      >
        <select
          class="rounded-xl border border-white/80 bg-white/90 px-3 py-2 text-sm text-slate-700"
          value={rule.field}
          onchange={(event) => onFieldChange(rule.id, event.currentTarget.value as ContactSortField)}
        >
          {#each sortFieldOptions as field (field)}
            <option value={field}>{contactSortFieldLabelMap[field]}</option>
          {/each}
        </select>

        <select
          class="rounded-xl border border-white/80 bg-white/90 px-3 py-2 text-sm text-slate-700"
          value={rule.direction}
          onchange={(event) => onDirectionChange(rule.id, event.currentTarget.value as SortDirection)}
        >
          <option value="ASC">ASC</option>
          <option value="DESC">DESC</option>
        </select>

        <button
          class="rounded-xl border border-white/80 bg-white/90 px-3 py-2 text-sm text-slate-700 shadow-sm
            hover:cursor-pointer hover:bg-white"
          type="button"
          disabled={sortRules.length <= 1}
          onclick={() => onRemoveRule(rule.id)}
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
    onclick={onAddRule}
  >
    Add sort rule
  </button>
</div>
