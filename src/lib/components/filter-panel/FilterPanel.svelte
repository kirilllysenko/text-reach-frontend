<script lang="ts">
  import Input from "../input/Input.svelte";
  import type { DataTableFilter } from "../table";
  import type {
    FilterPanelCheckboxGroup,
    FilterPanelConfig,
    FilterPanelField,
    FilterPanelInput,
  } from "./filter-panel-types";

  export interface FilterController {
    filters: DataTableFilter[];
    clear: () => void;
    remove: (filterId: string) => void;
    reset: () => void;
    set: (filterId: string, filter: DataTableFilter) => void;
  }

  interface Props {
    filtering: FilterController;
    config: FilterPanelConfig;
    compact?: boolean;
  }

  let { filtering, config, compact = false }: Props = $props();

  const chips = $derived.by(() => filtering.filters.map(formatChip));

  function getCheckboxValues(field: FilterPanelCheckboxGroup): string[] {
    const filter = filtering.filters.find(
      (current) =>
        current.type === "containment" &&
        current.filterId === field.filterId &&
        current.operator === (field.operator ?? "IN"),
    );

    return filter?.type === "containment" ? filter.value : [];
  }

  function getInputValue(input: FilterPanelInput): string {
    const filter = filtering.filters.find(
      (current) =>
        current.type === input.filterType && current.filterId === input.filterId && current.operator === input.operator,
    );

    if (!filter || filter.type === "containment" || typeof filter.value === "undefined" || filter.value === null) {
      return "";
    }

    return String(filter.value);
  }

  function updateCheckbox(field: FilterPanelCheckboxGroup, value: string): void {
    const currentValues = getCheckboxValues(field);
    const nextValues = currentValues.includes(value)
      ? currentValues.filter((currentValue) => currentValue !== value)
      : [...currentValues, value];
    const operator = field.operator ?? "IN";

    if (nextValues.length === 0) {
      filtering.remove(field.filterId);
      return;
    }

    filtering.set(field.filterId, {
      filterId: field.filterId,
      operator,
      type: "containment",
      value: nextValues,
    });
  }

  function updateInput(input: FilterPanelInput, value: string): void {
    const filterKey = { filterId: input.filterId, operator: input.operator, type: input.filterType };
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      filtering.remove(input.filterId);
      return;
    }

    filtering.set(input.filterId, {
      ...filterKey,
      value: input.valueKind === "number" ? Number(normalizedValue) : normalizedValue,
    } as DataTableFilter);
  }

  function formatChip(filter: DataTableFilter): string {
    const field = getFilterFields().find((current) => {
      const operator = current.kind === "checkbox-group" ? (current.operator ?? "IN") : current.operator;
      return current.filterId === filter.filterId && operator === filter.operator;
    });
    const label = field?.label ?? filter.filterId;

    if (filter.type === "containment") {
      return `${label}: ${filter.value.join(", ")}`;
    }

    return `${label}: ${filter.value ?? ""}`;
  }

  function getFilterFields(): (FilterPanelCheckboxGroup | FilterPanelInput)[] {
    return config.fields.reduce<(FilterPanelCheckboxGroup | FilterPanelInput)[]>((fields, field: FilterPanelField) => {
      if (field.kind === "input-grid") {
        fields.push(...field.inputs);
        return fields;
      }

      fields.push(field);
      return fields;
    }, []);
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
      <h3 class="text-sm font-semibold text-slate-700">{config.title}</h3>
      <p class="text-xs text-slate-500">{config.description}</p>
    </div>

    <button
      class="text-xs font-medium text-sky-700 hover:cursor-pointer hover:underline"
      type="button"
      onclick={() => filtering.clear()}
    >
      {config.clearLabel ?? "Clear filters"}
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

  {#each config.fields as field (field.id)}
    {#if field.kind === "checkbox-group"}
      {@const values = getCheckboxValues(field)}
      <div class="space-y-2">
        <p class="text-xs font-medium tracking-[0.02em] text-slate-500 uppercase">{field.label}</p>
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {#each field.options as option (option.value)}
            <label
              class="flex items-center gap-2 rounded-xl border border-white/80 bg-white/75 px-3 py-2 text-sm
                text-slate-700"
            >
              <input
                type="checkbox"
                checked={values.includes(option.value)}
                onchange={() => updateCheckbox(field, option.value)}
              />
              <span class="min-w-0 truncate">{option.label}</span>
            </label>
          {/each}
        </div>
      </div>
    {:else if field.kind === "input-grid"}
      <div
        class={[
          "grid grid-cols-1 gap-3",
          field.columns === 3 && "sm:grid-cols-3",
          field.columns === 2 && "sm:grid-cols-2",
          (!field.columns || field.columns === 1) && "sm:grid-cols-1",
        ]}
      >
        {#each field.inputs as input (input.id)}
          <label class="space-y-1">
            <span class="text-xs font-medium text-slate-500">{input.label}</span>
            <Input
              type={input.inputType}
              min={input.min}
              value={getInputValue(input)}
              placeholder={input.placeholder}
              oninput={(event) => updateInput(input, event.currentTarget.value)}
            />
          </label>
        {/each}
      </div>
    {/if}
  {/each}
</div>
