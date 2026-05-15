<script lang="ts">
  import CampaignDetailsContent from "./CampaignDetailsContent.svelte";
  import CampaignStatusBadge from "./CampaignStatusBadge.svelte";
  import type { CampaignsState } from "./campaigns-state.svelte";

  interface Props {
    state: CampaignsState;
  }

  let { state }: Props = $props();

  const createdAtHeaderLabel = $derived.by(() => {
    if (!state.selectedCampaign) {
      return "";
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(state.selectedCampaign.createdAt);
  });
</script>

<section class="flex h-full min-h-0 flex-col bg-gradient-to-br from-slate-100 via-slate-50 to-stone-100">
  {#if state.selectedCampaign}
    <header class="sticky top-0 z-10 border-b border-white/80 bg-white/60 px-3 pt-3 pb-2 backdrop-blur-md">
      <div class="flex items-center gap-2">
        <button
          class="h-9 rounded-xl border border-white/80 bg-white/90 px-3 text-sm font-medium text-slate-700
            shadow-sm hover:cursor-pointer hover:bg-white"
          type="button"
          onclick={state.backToMobileList}
        >
          ← Back
        </button>
        <div class="min-w-0 grow">
          <h2 class="truncate text-base font-semibold text-slate-800">{state.selectedCampaign.name}</h2>
          <p class="truncate text-xs text-slate-500">Created {createdAtHeaderLabel}</p>
        </div>
        <CampaignStatusBadge status={state.selectedCampaign.status} />
      </div>
    </header>

    <main class="min-h-0 grow overflow-y-auto p-3">
      <CampaignDetailsContent campaign={state.selectedCampaign} groupNames={state.selectedCampaignGroupNames} mobile />
    </main>
  {:else}
    <div class="flex h-full min-h-60 items-center justify-center text-sm text-slate-500">No campaign selected</div>
  {/if}
</section>
