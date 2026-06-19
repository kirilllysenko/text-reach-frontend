<script lang="ts" generics="TField extends string">
  import type { SortDirection } from "$lib/api/index.schemas";

  interface SortRule<TField extends string> {
    id: string;
    field: TField;
    direction: SortDirection;
  }

  interface SortFieldOption<TField extends string> {
    value: TField;
    label: string;
  }

  interface Props<TField extends string> {
    rules: SortRule<TField>[];
    fieldOptions: SortFieldOption<TField>[];
    chips: string[];
    compact?: boolean;
    directionOptions?: SortDirection[];
    onAddRule: () => void;
    onRemoveRule: (ruleId: string) => void;
    onFieldChange: (ruleId: string, field: TField) => void;
    onDirectionChange: (ruleId: string, direction: SortDirection) => void;
    onReset: () => void;
  }

  let {
    rules,
    fieldOptions,
    chips,
    compact = false,
    directionOptions = ["ASC", "DESC"],
    onAddRule,
    onRemoveRule,
    onFieldChange,
    onDirectionChange,
    onReset,
  }: Props<TField> = $props();
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
    {#each chips as chip (chip)}
      <span class="rounded-full border border-white/80 bg-white/90 px-2.5 py-1 text-xs text-slate-700">
        {chip}
      </span>
    {/each}
  </div>

  <div class="space-y-2">
    {#each rules as rule (rule.id)}
      <div
        class="grid grid-cols-[minmax(0,1fr)_7rem_auto] items-center gap-2 rounded-xl border border-white/80
          bg-white/75 p-2"
      >
        <select
          class="rounded-xl border border-white/80 bg-white/90 px-3 py-2 text-sm text-slate-700"
          value={rule.field}
          onchange={(event) => onFieldChange(rule.id, event.currentTarget.value as TField)}
        >
          {#each fieldOptions as field (field.value)}
            <option value={field.value}>{field.label}</option>
          {/each}
        </select>

        <select
          class="rounded-xl border border-white/80 bg-white/90 px-3 py-2 text-sm text-slate-700"
          value={rule.direction}
          onchange={(event) => onDirectionChange(rule.id, event.currentTarget.value as SortDirection)}
        >
          {#each directionOptions as direction (direction)}
            <option value={direction}>{direction}</option>
          {/each}
        </select>

        <button
          class="rounded-xl border border-white/80 bg-white/90 px-3 py-2 text-sm text-slate-700 shadow-sm
            hover:cursor-pointer hover:bg-white"
          type="button"
          disabled={rules.length <= 1}
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
