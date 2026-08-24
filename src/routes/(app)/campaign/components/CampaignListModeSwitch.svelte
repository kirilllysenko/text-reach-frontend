<script lang="ts">
  import type { CampaignListMode } from "./campaign-state.svelte";

  interface Props {
    mode: CampaignListMode;
    onChange: (mode: CampaignListMode) => void;
  }

  let { mode, onChange }: Props = $props();

  const options: { label: string; value: CampaignListMode }[] = [
    { label: "Schedule", value: "schedule" },
    { label: "History", value: "history" },
  ];
</script>

<div class="grid grid-cols-2 rounded-xl bg-slate-200/70 p-1 shadow-inner" role="group" aria-label="Campaign list view">
  {#each options as option (option.value)}
    <button
      id={`campaign-view-${option.value}`}
      class={[
        "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40",
        mode === option.value ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700",
      ]}
      type="button"
      aria-pressed={mode === option.value}
      onclick={() => onChange(option.value)}
    >
      {option.label}
    </button>
  {/each}
</div>
