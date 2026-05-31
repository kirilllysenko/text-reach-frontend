<script lang="ts">
  import { FilterPanel, Input } from "$lib";
  import type { CampaignStatus } from "$lib/features/campaigns/campaigns-view-data";

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

<FilterPanel {activeFilterChips} title="Active filters" description="Refine the campaign feed" {compact} {onClear}>
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
</FilterPanel>
