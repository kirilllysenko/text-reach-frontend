<script lang="ts">
  import { Input } from "$lib";
  import type { CampaignStatus } from "./campaigns-models";

  interface Props {
    activeFilterChips: string[];
    statusOptions: NonNullable<CampaignStatus>[];
    selectedStatuses: NonNullable<CampaignStatus>[];
    createdAfter: string;
    minSentMessageCount: string;
    minMessageCount: string;
    compact?: boolean;
    statusLabel: (status: NonNullable<CampaignStatus>) => string;
    onToggleStatus: (status: NonNullable<CampaignStatus>) => void;
    onCreatedAfterInput: (value: string) => void;
    onMinSentInput: (value: string) => void;
    onMinMessageInput: (value: string) => void;
    onClear: () => void;
  }

  let {
    activeFilterChips,
    statusOptions,
    selectedStatuses,
    createdAfter,
    minSentMessageCount,
    minMessageCount,
    compact = false,
    statusLabel,
    onToggleStatus,
    onCreatedAfterInput,
    onMinSentInput,
    onMinMessageInput,
    onClear,
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
      <h3 class="text-sm font-semibold text-slate-700">Active filters</h3>
      <p class="text-xs text-slate-500">Refine the campaign feed</p>
    </div>

    <button
      class="text-xs font-medium text-sky-700 hover:cursor-pointer hover:underline"
      type="button"
      onclick={onClear}
    >
      Clear filters
    </button>
  </div>

  {#if activeFilterChips.length > 0}
    <div class="flex flex-wrap gap-2">
      {#each activeFilterChips as chip (chip)}
        <span class="rounded-full border border-white/80 bg-white/90 px-2.5 py-1 text-xs text-slate-700">
          {chip}
        </span>
      {/each}
    </div>
  {/if}

  <div class="space-y-2">
    <p class="text-xs font-medium tracking-[0.02em] text-slate-500 uppercase">Status</p>
    <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {#each statusOptions as status (status)}
        <label
          class="flex items-center gap-2 rounded-xl border border-white/80 bg-white/75 px-3 py-2 text-sm text-slate-700"
        >
          <input type="checkbox" checked={selectedStatuses.includes(status)} onchange={() => onToggleStatus(status)} />
          {statusLabel(status)}
        </label>
      {/each}
    </div>
  </div>

  <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
    <label class="space-y-1">
      <span class="text-xs font-medium text-slate-500">Created after</span>
      <Input type="date" value={createdAfter} oninput={(event) => onCreatedAfterInput(event.currentTarget.value)} />
    </label>

    <label class="space-y-1">
      <span class="text-xs font-medium text-slate-500">Min sent messages</span>
      <Input
        type="number"
        min="0"
        value={minSentMessageCount}
        oninput={(event) => onMinSentInput(event.currentTarget.value)}
      />
    </label>

    <label class="space-y-1">
      <span class="text-xs font-medium text-slate-500">Min all messages</span>
      <Input
        type="number"
        min="0"
        value={minMessageCount}
        oninput={(event) => onMinMessageInput(event.currentTarget.value)}
      />
    </label>
  </div>
</div>
