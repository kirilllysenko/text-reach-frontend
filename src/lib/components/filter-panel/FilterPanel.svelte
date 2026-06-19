<script lang="ts">
  import Input from "../input/Input.svelte";
  import type { FilterPanelConfig } from "./filter-panel-types";

  interface Props {
    filtering: FilterPanelConfig;
    compact?: boolean;
  }

  let { filtering, compact = false }: Props = $props();
</script>

<div
  class={[
    `space-y-3 rounded-xl border border-white/80 bg-white/80 p-3 shadow-sm backdrop-blur-sm`,
    compact && "text-sm",
  ]}
>
  <div class="flex items-center justify-between gap-3">
    <div>
      <h3 class="text-sm font-semibold text-slate-700">{filtering.title}</h3>
      <p class="text-xs text-slate-500">{filtering.description}</p>
    </div>

    <button
      class="text-xs font-medium text-sky-700 hover:cursor-pointer hover:underline"
      type="button"
      onclick={filtering.onClear}
    >
      {filtering.clearLabel ?? "Clear filters"}
    </button>
  </div>

  {#if filtering.activeFilterChips.length > 0}
    <div class="flex flex-wrap gap-2">
      {#each filtering.activeFilterChips as chip (chip)}
        <span class="rounded-full border border-white/80 bg-white/90 px-2.5 py-1 text-xs text-slate-700">
          {chip}
        </span>
      {/each}
    </div>
  {/if}

  {#each filtering.fields as field (field.id)}
    {#if field.kind === "checkbox-group"}
      <div class="space-y-2">
        <p class="text-xs font-medium tracking-[0.02em] text-slate-500 uppercase">{field.label}</p>
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {#each field.options as option (option.value)}
            <label
              class="flex items-center gap-2 rounded-xl border border-white/80 bg-white/75 px-3 py-2 text-sm
                text-slate-700"
            >
              <input type="checkbox" checked={option.checked} onchange={() => field.onToggle(option.value)} />
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
              value={input.value}
              placeholder={input.placeholder}
              oninput={(event) => input.onInput(event.currentTarget.value)}
            />
          </label>
        {/each}
      </div>
    {/if}
  {/each}
</div>
