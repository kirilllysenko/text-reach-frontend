<script lang="ts">
  import { Input } from "$lib";
  import type { CampaignState } from "$lib/feature/campaign/campaign-state.svelte";
  import type { CampaignStatus } from "$lib/feature/campaign/campaign-view-data";

  interface Props {
    state: CampaignState;
  }

  let { state }: Props = $props();

  function updateStatus(status: NonNullable<CampaignStatus>): void {
    const statusFilters = state.statusFilters.includes(status)
      ? state.statusFilters.filter((current) => current !== status)
      : [...state.statusFilters, status];

    state.setFilter("status", {
      filterId: "status",
      operator: "IN",
      type: "containment",
      value: statusFilters,
    });
  }

  function updateCreatedAfter(value: string): void {
    setComparisonFilter("createdAfter", value);
  }

  function updateMinSentMessageCount(value: string): void {
    setComparisonFilter("minSentMessageCount", value);
  }

  function updateMinMessageCount(value: string): void {
    setComparisonFilter("minMessageCount", value);
  }

  function setComparisonFilter(filterId: string, value: string): void {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      state.removeFilter(filterId);
      return;
    }

    state.setFilter(filterId, {
      filterId,
      operator: "GREATER_OR_EQUAL",
      type: "comparison",
      value: filterId === "createdAfter" ? normalizedValue : Number(normalizedValue),
    });
  }
</script>

<div class="space-y-3 rounded-xl border border-white/80 bg-white/80 p-3 text-sm shadow-sm backdrop-blur-sm">
  <div class="flex items-center justify-between gap-3">
    <div>
      <h3 class="text-sm font-semibold text-slate-700">Active filters</h3>
      <p class="text-xs text-slate-500">Refine the campaign feed</p>
    </div>

    <button
      class="text-xs font-medium text-sky-700 hover:cursor-pointer hover:underline"
      type="button"
      onclick={state.clearFilters}
    >
      Clear filters
    </button>
  </div>

  {#if state.activeFilterChips.length > 0}
    <div class="flex flex-wrap gap-2">
      {#each state.activeFilterChips as chip (chip)}
        <span class="rounded-full border border-white/80 bg-white/90 px-2.5 py-1 text-xs text-slate-700">
          {chip}
        </span>
      {/each}
    </div>
  {/if}

  <div class="space-y-2">
    <p class="text-xs font-medium tracking-[0.02em] text-slate-500 uppercase">Status</p>
    <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {#each state.statusOptions as status (status)}
        <label
          class="flex items-center gap-2 rounded-xl border border-white/80 bg-white/75 px-3 py-2 text-sm text-slate-700"
        >
          <input type="checkbox" checked={state.statusFilters.includes(status)} onchange={() => updateStatus(status)} />
          <span class="min-w-0 truncate">{state.statusLabel(status)}</span>
        </label>
      {/each}
    </div>
  </div>

  <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
    <label class="space-y-1">
      <span class="text-xs font-medium text-slate-500">Created after</span>
      <Input
        type="date"
        value={state.createdAfter}
        oninput={(event) => updateCreatedAfter(event.currentTarget.value)}
      />
    </label>

    <label class="space-y-1">
      <span class="text-xs font-medium text-slate-500">Min sent messages</span>
      <Input
        type="number"
        min="0"
        value={state.minSentMessageCount}
        oninput={(event) => updateMinSentMessageCount(event.currentTarget.value)}
      />
    </label>

    <label class="space-y-1">
      <span class="text-xs font-medium text-slate-500">Min all messages</span>
      <Input
        type="number"
        min="0"
        value={state.minMessageCount}
        oninput={(event) => updateMinMessageCount(event.currentTarget.value)}
      />
    </label>
  </div>
</div>
