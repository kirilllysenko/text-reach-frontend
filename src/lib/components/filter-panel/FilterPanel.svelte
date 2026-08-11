<script lang="ts" generics="TFilter">
  import Input from "../input/Input.svelte";
  import type {
    DataTableComparisonFilterComponentProps,
    DataTableComparisonFilterDefinition,
    DataTableContainmentFilterComponentProps,
    DataTableContainmentFilterDefinition,
    DataTableFilter,
    DataTableFilterDefinition,
    DataTableFilterValue,
    DataTableTextFilterComponentProps,
    DataTableTextFilterDefinition,
    FilteringService,
  } from "../table";
  import type {
    FilterPanelCheckboxGroup,
    FilterPanelConfig,
    FilterPanelField,
    FilterPanelInput,
  } from "./filter-panel-types";

  interface Props {
    filtering: FilteringService<TFilter>;
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
    filtering.filters.filter((filter) => config || visibleFilterIds.has(filtering.getFilterId(filter))).map(formatChip),
  );
  const panelTitle = $derived(config?.title ?? title);
  const panelDescription = $derived(config?.description ?? description);
  const panelClearLabel = $derived(config?.clearLabel ?? clearLabel ?? "Clear filters");

  function getContainmentValues(field: FilterPanelCheckboxGroup): string[] {
    const filter = filtering.getFilter(field.filterId);

    if (!filter || filtering.getFilterOperator(filter) !== (field.operator ?? "IN")) {
      return [];
    }

    const value = filtering.getFilterValue(filter);
    return Array.isArray(value) ? value : [];
  }

  function getDefinitionFilter(definition: DataTableFilterDefinition<string, any, TFilter>): TFilter | null {
    const filter = filtering.getFilter(definition.filterId);
    return filter && filtering.getFilterOperator(filter) === getDefinitionOperator(definition) ? filter : null;
  }

  function getDefinitionValue(
    definition: DataTableFilterDefinition<string, any, TFilter>,
  ): DataTableFilterValue | null {
    const filter = getDefinitionFilter(definition);
    return filter ? filtering.getFilterValue(filter) : null;
  }

  function getInputValue(input: FilterPanelInput): string {
    const filter = filtering.getFilter(input.filterId);

    if (
      !filter ||
      filtering.getFilterType(filter) !== input.filterType ||
      filtering.getFilterOperator(filter) !== input.operator
    ) {
      return "";
    }

    const value = filtering.getFilterValue(filter);
    return Array.isArray(value) || typeof value === "undefined" || value === null ? "" : String(value);
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

    filtering.setFilterValue(field.filterId, nextValues, operator);
  }

  function updateInput(input: FilterPanelInput, value: string): void {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      filtering.removeFilter(input.filterId);
      return;
    }

    filtering.setFilterValue(
      input.filterId,
      input.valueKind === "number" ? Number(normalizedValue) : normalizedValue,
      input.operator,
    );
  }

  function setDefinitionValue(
    definition: DataTableFilterDefinition<string, any, TFilter>,
    nextValue: DataTableFilterValue | null | undefined,
  ): void {
    if (shouldClearDefinition(definition, nextValue)) {
      filtering.removeFilter(definition.filterId);
      return;
    }

    filtering.setFilterValue(definition.filterId, nextValue, getDefinitionOperator(definition));
  }

  function shouldClearDefinition(
    definition: DataTableFilterDefinition<string, any, TFilter>,
    value: DataTableFilterValue | null | undefined,
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

  function getDefinitionOperator(
    definition: DataTableFilterDefinition<string, any, TFilter>,
  ): DataTableFilter["operator"] {
    if (definition.type === "comparison") {
      return definition.defaultOperator ?? "EQUAL";
    }

    if (definition.type === "containment") {
      return definition.defaultOperator ?? "IN";
    }

    return definition.defaultOperator ?? "CONTAINS";
  }

  function getDefinitionInputType(definition: DataTableFilterDefinition<string, any, TFilter>): "date" | "search" {
    const dateLikeId = definition.filterId.toLowerCase();

    if (definition.type === "comparison" && (dateLikeId.includes("birthday") || dateLikeId.includes("date"))) {
      return "date";
    }

    return "search";
  }

  function formatChip(filter: TFilter): string {
    const filterId = filtering.getFilterId(filter);
    const operator = filtering.getFilterOperator(filter);
    const type = filtering.getFilterType(filter);
    const value = filtering.getFilterValue(filter);
    if (!config) {
      return formatDefinitionChip(filter);
    }

    const field = getFilterFields().find((current) => {
      const currentOperator = current.kind === "input" ? current.operator : (current.operator ?? "IN");
      return current.filterId === filterId && currentOperator === operator;
    });
    const label = field?.label ?? filterId;

    if (type === "containment" && Array.isArray(value)) {
      return `${label}: ${formatContainmentChip(field, value)}`;
    }

    return `${label}: ${value ?? ""}`;
  }

  function formatDefinitionChip(filter: TFilter): string {
    const filterId = filtering.getFilterId(filter);
    const type = filtering.getFilterType(filter);
    const value = filtering.getFilterValue(filter);
    const definition = filtering.filterDefinitions.find((current) => current.filterId === filterId);
    const label = definition?.label ?? filterId;

    if (definition?.formatValue) {
      return `${label}: ${definition.formatValue(value, filter)}`;
    }

    if (type === "containment" && Array.isArray(value)) {
      return `${label}: ${value.join(", ")}`;
    }

    return `${label}: ${value ?? ""}`;
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

  function getTextComponentProps(
    definition: DataTableTextFilterDefinition<string, any, TFilter>,
  ): DataTableTextFilterComponentProps {
    return getComponentProps(definition) as DataTableTextFilterComponentProps;
  }

  function getComparisonComponentProps(
    definition: DataTableComparisonFilterDefinition<string, any, TFilter>,
  ): DataTableComparisonFilterComponentProps {
    return getComponentProps(definition) as DataTableComparisonFilterComponentProps;
  }

  function getContainmentComponentProps(
    definition: DataTableContainmentFilterDefinition<string, any, TFilter>,
  ): DataTableContainmentFilterComponentProps {
    return getComponentProps(definition) as DataTableContainmentFilterComponentProps;
  }

  function getComponentProps(definition: DataTableFilterDefinition<string, any, TFilter>): FilterComponentProps {
    const getValue = () => getDefinitionValue(definition) ?? null;

    return {
      value: getValue(),
      getValue,
      setValue: (nextValue: DataTableFilterValue | null | undefined) => setDefinitionValue(definition, nextValue),
      clear: () => filtering.removeFilter(definition.filterId),
    };
  }

  type FilterComponentProps = {
    value: DataTableFilterValue | null;
    getValue: () => DataTableFilterValue | null;
    setValue: (nextValue: DataTableFilterValue | null | undefined) => void;
    clear: () => void;
  };
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

        {#if definition.type === "text" && definition.component}
          {@const FilterControl = definition.component}
          <FilterControl {...getTextComponentProps(definition)} />
        {:else if definition.type === "comparison" && definition.component}
          {@const FilterControl = definition.component}
          <FilterControl {...getComparisonComponentProps(definition)} />
        {:else if definition.type === "containment" && definition.component}
          {@const FilterControl = definition.component}
          <FilterControl {...getContainmentComponentProps(definition)} />
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
