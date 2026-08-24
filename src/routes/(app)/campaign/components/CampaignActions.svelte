<script lang="ts">
  import { cache, CancelCampaignStore, PauseCampaignStore, ResumeCampaignStore } from "$houdini";
  import { AccessGroup } from "$houdini/graphql/enums";
  import { Button, Dialog } from "$lib";
  import { sessionState } from "$lib/state/session.svelte";
  import { notificationsState } from "text-reach-frontend-library/state/notifications.svelte";
  import { getCampaignActions, type CampaignAction } from "./campaign-actions";
  import type { CampaignStatus, CampaignViewModel } from "./campaign-view-data";

  interface Props {
    campaign: CampaignViewModel;
    onStatusChanged: (campaignId: string, status: CampaignStatus) => void;
  }

  let { campaign, onStatusChanged }: Props = $props();

  const pauseCampaignMutation = new PauseCampaignStore();
  const resumeCampaignMutation = new ResumeCampaignStore();
  const cancelCampaignMutation = new CancelCampaignStore();

  let activeAction = $state<CampaignAction | null>(null);
  let confirmCancel = $state(false);
  const actions = $derived(getCampaignActions(campaign.status));
  const canWriteCampaigns = $derived(sessionState.hasAccess(AccessGroup.CAMPAIGN_WRITE));

  async function performAction(action: CampaignAction): Promise<void> {
    if (activeAction) {
      return;
    }

    activeAction = action;

    try {
      const result = await mutateCampaign(action);

      if (result.hasErrors || !result.campaign) {
        notificationsState.showError("There was an error.");
        return;
      }

      cache.markStale("CampaignConnection");
      onStatusChanged(result.campaign.id, result.campaign.status);
      confirmCancel = false;
      notificationsState.showInfo(successMessage(action));
    } catch {
      notificationsState.showError("There was an error.");
    } finally {
      activeAction = null;
    }
  }

  async function mutateCampaign(
    action: CampaignAction,
  ): Promise<{ campaign?: { id: string; status: CampaignStatus } | null; hasErrors: boolean }> {
    if (action === "pause") {
      const response = await pauseCampaignMutation.mutate({ id: campaign.id });
      return { campaign: response.data?.pauseCampaign, hasErrors: Boolean(response.errors) };
    }

    if (action === "resume") {
      const response = await resumeCampaignMutation.mutate({ id: campaign.id });
      return { campaign: response.data?.resumeCampaign, hasErrors: Boolean(response.errors) };
    }

    const response = await cancelCampaignMutation.mutate({ id: campaign.id });
    return { campaign: response.data?.cancelCampaign, hasErrors: Boolean(response.errors) };
  }

  function successMessage(action: CampaignAction): string {
    if (action === "pause") {
      return "Campaign has been paused.";
    }

    if (action === "resume") {
      return "Campaign has been resumed.";
    }

    return "Campaign has been cancelled.";
  }
</script>

{#if canWriteCampaigns && actions.length > 0}
  <div class="flex flex-wrap items-center justify-end gap-2" aria-label="Campaign actions">
    {#if actions.includes("pause")}
      <Button
        id="campaign-pause"
        variant="secondary"
        disabled={activeAction !== null}
        spinner={activeAction === "pause"}
        onclick={() => performAction("pause")}>Pause</Button
      >
    {/if}

    {#if actions.includes("resume")}
      <Button
        id="campaign-resume"
        variant="secondary"
        disabled={activeAction !== null}
        spinner={activeAction === "resume"}
        onclick={() => performAction("resume")}>Resume</Button
      >
    {/if}

    {#if actions.includes("cancel")}
      <Button
        id="campaign-cancel"
        class="text-rose-700"
        variant="secondary"
        disabled={activeAction !== null}
        onclick={() => (confirmCancel = true)}>Cancel campaign</Button
      >
    {/if}
  </div>
{/if}

{#if canWriteCampaigns && confirmCancel}
  <div class="fixed inset-0 z-60 flex items-center justify-center">
    <button
      class="absolute inset-0 bg-slate-900/35 backdrop-blur-[1px]"
      type="button"
      aria-label="Keep campaign"
      disabled={activeAction !== null}
      onclick={() => (confirmCancel = false)}
    ></button>

    <div class="relative z-10">
      <Dialog role="dialog" aria-modal="true" aria-labelledby="cancel-campaign-title">
        <h2 id="cancel-campaign-title" class="text-lg font-semibold text-slate-800">Cancel campaign?</h2>
        <p class="mt-2 text-sm text-slate-600">
          Any messages that have not been sent will be cancelled. This campaign cannot be resumed afterward.
        </p>

        <div class="mt-5 flex justify-end gap-2">
          <Button variant="secondary" disabled={activeAction !== null} onclick={() => (confirmCancel = false)}>
            Keep campaign
          </Button>
          <Button spinner={activeAction === "cancel"} onclick={() => performAction("cancel")}>Cancel campaign</Button>
        </div>
      </Dialog>
    </div>
  </div>
{/if}
