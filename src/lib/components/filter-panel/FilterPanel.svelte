<script lang="ts">
  import Input from "../input/Input.svelte";
  import type { DataTableFilter, DataTableFilterDefinition } from "../table";
  import type {
    FilterPanelCheckboxGroup,
    FilterPanelConfig,
    FilterPanelController,
    FilterPanelField,
    FilterPanelInput,
  } from "./filter-panel-types";

  interface Props {
    filtering: FilterPanelController;
    clearLabel?: string;
    compact?: boolean;
    config?: FilterPanelConfig;
    description?: string;
    title?: string;
  }

  let {
    filtering,
    clearLabel,
    compact = false,
    config,
    description = "Refine the table",
    title = "Active filters",
  }: Props = $props();

  const filterDefinitions = $derived(filtering.filterDefinitions?.filter((definition) => !definition.hidden) ?? []);
  const visibleFilterIds = $derived(new Set(filterDefinitions.map((definition) => definition.filterId)));
  const chips = $derived.by(() =>
    filtering.filters.filter((filter) => config || visibleFilterIds.has(filter.filterId)).map(formatChip),
  );
  const panelTitle = $derived(config?.title ?? title);
  const panelDescription = $derived(config?.description ?? description);
  const panelClearLabel = $derived(config?.clearLabel ?? clearLabel ?? "Clear filters");

  function getContainmentValues(field: FilterPanelCheckboxGroup): string[] {
    const filter = filtering.filters.find(
      (current) =>
        current.type === "containment" &&
        current.filterId === field.filterId &&
        current.operator === (field.operator ?? "IN"),
    );

    return filter?.type === "containment" ? filter.value : [];
  }

  function getDefinitionFilter(definition: DataTableFilterDefinition): DataTableFilter | null {
    return (
      filtering.filters.find(
        (current) => current.filterId === definition.filterId && current.operator === getDefinitionOperator(definition),
      ) ?? null
    );
  }

  function getDefinitionValue(definition: DataTableFilterDefinition): DataTableFilter["value"] | null {
    return getDefinitionFilter(definition)?.value ?? null;
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
    const currentValues = getContainmentValues(field);
    const nextValues = currentValues.includes(value)
      ? currentValues.filter((currentValue) => currentValue !== value)
      : [...currentValues, value];

    updateContainmentValues(field, nextValues);
  }

  function updateContainmentValues(field: FilterPanelCheckboxGroup, nextValues: string[]): void {
    const operator = field.operator ?? "IN";

    if (nextValues.length === 0) {
      filtering.removeFilter(field.filterId);
      return;
    }

    filtering.setFilter(field.filterId, {
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
      filtering.removeFilter(input.filterId);
      return;
    }

    filtering.setFilter(input.filterId, {
      ...filterKey,
      value: input.valueKind === "number" ? Number(normalizedValue) : normalizedValue,
    } as DataTableFilter);
  }

  function setDefinitionValue(
    definition: DataTableFilterDefinition,
    nextValue: DataTableFilter["value"] | null | undefined,
  ): void {
    if (shouldClearDefinition(definition, nextValue)) {
      filtering.removeFilter(definition.filterId);
      return;
    }

    filtering.setFilter(definition.filterId, {
      filterId: definition.filterId,
      operator: getDefinitionOperator(definition),
      type: definition.type,
      value: nextValue,
    } as DataTableFilter);
  }

  function shouldClearDefinition(
    definition: DataTableFilterDefinition,
    value: DataTableFilter["value"] | null | undefined,
  ): boolean {
    if (value === null || typeof value === "undefined") {
      return true;
    }

    if (definition.type === "containment") {
      return !Array.isArray(value) || value.length === 0;
    }

    if (definition.type === "text") {
      return typeof value !== "string" || value.trim() === "";
    }

    return value === "";
  }

  function getDefinitionOperator(definition: DataTableFilterDefinition): DataTableFilter["operator"] {
    if (definition.type === "comparison") {
      return definition.defaultOperator ?? "EQUAL";
    }

    if (definition.type === "containment") {
      return definition.defaultOperator ?? "IN";
    }

    return definition.defaultOperator ?? "CONTAINS";
  }

  function getDefinitionInputType(definition: DataTableFilterDefinition): "date" | "search" {
    const dateLikeId = definition.filterId.toLowerCase();

    if (definition.type === "comparison" && (dateLikeId.includes("birthday") || dateLikeId.includes("date"))) {
      return "date";
    }

    return "search";
  }

  function formatChip(filter: DataTableFilter): string {
    if (!config) {
      return formatDefinitionChip(filter);
    }

    const field = getFilterFields().find((current) => {
      const operator = current.kind === "input" ? current.operator : (current.operator ?? "IN");
      return current.filterId === filter.filterId && operator === filter.operator;
    });
    const label = field?.label ?? filter.filterId;

    if (filter.type === "containment") {
      return `${label}: ${formatContainmentChip(field, filter.value)}`;
    }

    return `${label}: ${filter.value ?? ""}`;
  }

  function formatDefinitionChip(filter: DataTableFilter): string {
    const definition = filtering.filterDefinitions?.find((current) => current.filterId === filter.filterId);
    const label = definition?.label ?? filter.filterId;

    if (definition?.formatValue) {
      return `${label}: ${definition.formatValue(filter.value, filter)}`;
    }

    if (filter.type === "containment") {
      return `${label}: ${filter.value.join(", ")}`;
    }

    return `${label}: ${filter.value ?? ""}`;
  }

  function formatContainmentChip(
    field: FilterPanelCheckboxGroup | FilterPanelInput | undefined,
    values: string[],
  ): string {
    if (field?.kind === "checkbox-group") {
      const labelByValue = new Map(field.options.map((option) => [option.value, option.label]));
      return values.map((value) => labelByValue.get(value) ?? value).join(", ");
    }

    return values.join(", ");
  }

  function getFilterFields(): (FilterPanelCheckboxGroup | FilterPanelInput)[] {
    return (config?.fields ?? []).reduce<(FilterPanelCheckboxGroup | FilterPanelInput)[]>(
      (fields, field: FilterPanelField) => {
        if (field.kind === "input-grid") {
          fields.push(...field.inputs);
          return fields;
        }

        fields.push(field);
        return fields;
      },
      [],
    );
  }

  function clearPanelFilters(): void {
    if (config) {
      filtering.clearFilters();
      return;
    }

    filterDefinitions.forEach((definition) => filtering.removeFilter(definition.filterId));
  }

  function getSnippetProps(definition: DataTableFilterDefinition) {
    return {
      filter: getDefinitionFilter(definition),
      value: getDefinitionValue(definition),
      getValue: () => getDefinitionValue(definition),
      setValue: (nextValue: DataTableFilter["value"] | null | undefined) => setDefinitionValue(definition, nextValue),
      clear: () => filtering.removeFilter(definition.filterId),
    };
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
      <h3 class="text-sm font-semibold text-slate-700">{panelTitle}</h3>
      <p class="text-xs text-slate-500">{panelDescription}</p>
    </div>

    <button
      class="text-xs font-medium text-sky-700 hover:cursor-pointer hover:underline"
      type="button"
      onclick={clearPanelFilters}
    >
      {panelClearLabel}
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

  {#if config}
    {#each config.fields as field (field.id)}
      {#if field.kind === "checkbox-group"}
        {@const values = getContainmentValues(field)}
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
  {:else}
    {#each filterDefinitions as definition (definition.filterId)}
      <div class="space-y-1">
        <span class="text-xs font-medium text-slate-500">{definition.label ?? definition.filterId}</span>

        {#if definition.snippet}
          {@render definition.snippet(getSnippetProps(definition))}
        {:else if definition.type === "text" || definition.type === "comparison"}
          <Input
            type={getDefinitionInputType(definition)}
            value={String(getDefinitionValue(definition) ?? "")}
            oninput={(event) => setDefinitionValue(definition, event.currentTarget.value)}
          />
        {/if}
      </div>
    {/each}
  {/if}
</div>
