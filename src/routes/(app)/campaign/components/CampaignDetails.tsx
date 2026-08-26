import { createSignal, For, Show } from "solid-js";
import {
  CancelCampaignDocument,
  PauseCampaignDocument,
  ResumeCampaignDocument,
  type CampaignStatus,
} from "~/gql/graphql";
import { buildCampaignMessagesPath } from "~/lib/app/paths";
import { Button, LinkButton } from "~/components";
import {
  formatCampaignSchedule,
  getCampaignActions,
  statusLabelMap,
  type CampaignAction,
  type CampaignViewModel,
} from "~/lib/feature/campaign/campaign-data";
import { formatPhoneNumber } from "~/lib/feature/phone/phone-display";
import { graphqlClient } from "~/lib/graphql/client";
import { classes } from "~/lib/styles/classes";
import { showError, showInfo } from "~/lib/state/notifications";
import { hasAccess } from "~/lib/state/session";

interface CampaignDetailsProps {
  campaign?: CampaignViewModel;
  groupNames: string[];
  onStatusChanged: (campaignId: string, status: CampaignStatus) => void;
}

export function CampaignDetails(props: CampaignDetailsProps) {
  return (
    <Show
      when={props.campaign}
      keyed
      fallback={<div class="grid h-full min-h-80 place-items-center text-sm text-slate-500">No campaign selected</div>}
    >
      {(campaign) => {
        const scheduledAt = () => formatCampaignSchedule(campaign.scheduledAt);
        const pendingPercent = () => percent(campaign.pendingMessageCount, campaign.messageCount);
        const sentPercent = () => percent(campaign.sentMessageCount, campaign.messageCount);
        return (
          <div class="space-y-4">
            <div class="flex flex-wrap items-start justify-between gap-3 border-b border-white/70 pb-4">
              <div>
                <h2 class="text-xl font-semibold text-slate-800">{campaign.name}</h2>
                <p class="mt-1 text-sm text-slate-500">From {formatPhoneNumber(campaign.tenantPhoneNumber)}</p>
              </div>
              <div class="flex flex-wrap items-center justify-end gap-2">
                <CampaignStatusBadge status={campaign.status} />
                <LinkButton class="text-sm" href={buildCampaignMessagesPath(campaign.id)}>
                  View messages
                </LinkButton>
                <CampaignActions campaign={campaign} onStatusChanged={props.onStatusChanged} />
              </div>
            </div>

            <section class="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Show when={scheduledAt()}>
                {(date) => <Metric label="Scheduled for" value={date()} accent="text-violet-700" />}
              </Show>
              <Metric label="All messages" value={String(campaign.messageCount)} />
              <Metric label="Pending messages" value={String(campaign.pendingMessageCount)} accent="text-sky-700" />
              <Metric label="Sent messages" value={String(campaign.sentMessageCount)} accent="text-emerald-600" />
            </section>

            <section class="rounded-xl border border-white/80 bg-gradient-to-r from-sky-50/80 via-white/80 to-stone-50/70 p-4 shadow-sm">
              <div class="flex flex-wrap items-center gap-3 text-xs">
                <span class="inline-flex items-center gap-1.5 text-slate-700">
                  <span class="size-2.5 rounded-full bg-sky-500" /> Pending: {campaign.pendingMessageCount} (
                  {pendingPercent().toFixed(1)}%)
                </span>
                <span class="inline-flex items-center gap-1.5 text-slate-700">
                  <span class="size-2.5 rounded-full bg-emerald-500" /> Sent: {campaign.sentMessageCount} (
                  {sentPercent().toFixed(1)}%)
                </span>
              </div>
              <div class="mt-3 flex h-6 overflow-hidden rounded-full border border-white/80 bg-white/90 shadow-inner">
                <div class="h-full bg-sky-500" style={{ width: `${pendingPercent()}%` }} />
                <div class="h-full bg-emerald-500" style={{ width: `${sentPercent()}%` }} />
              </div>
            </section>

            <section class="grid gap-3 lg:grid-cols-2">
              <div class="rounded-xl border border-white/80 bg-white/75 p-4 shadow-sm">
                <h3 class="mb-3 text-sm font-semibold text-slate-700">Audience</h3>
                <div class="flex flex-wrap gap-2">
                  <Show
                    when={props.groupNames.length > 0}
                    fallback={<span class="text-sm text-slate-500">No groups</span>}
                  >
                    <For each={props.groupNames}>
                      {(name) => <span class="rounded-full bg-white px-2.5 py-1 text-xs text-slate-700">{name}</span>}
                    </For>
                  </Show>
                </div>
              </div>
              <div class="rounded-xl border border-white/80 bg-white/75 p-4 shadow-sm">
                <h3 class="mb-3 text-sm font-semibold text-slate-700">Message</h3>
                <p class="text-sm break-words whitespace-pre-wrap text-slate-800">{campaign.messageTemplate}</p>
              </div>
            </section>
          </div>
        );
      }}
    </Show>
  );
}

export function CampaignStatusBadge(props: { status: CampaignStatus }) {
  const paused = () => ["PAUSED_BY_USER", "PAUSED_LOW_BALANCE"].includes(props.status);
  const cancelled = () => ["CANCELLED_BY_USER", "CANCELLED_BY_TIMEOUT"].includes(props.status);
  return (
    <span
      class={classes([
        "rounded-full border px-2.5 py-1 text-xs font-medium",
        props.status === "SCHEDULED" && "border-violet-200 bg-violet-100 text-violet-700",
        props.status === "SENT" && "border-emerald-200 bg-emerald-100 text-emerald-700",
        props.status === "SENDING" && "border-sky-200 bg-sky-100 text-sky-700",
        paused() && "border-amber-200 bg-amber-100 text-amber-800",
        cancelled() && "border-rose-200 bg-rose-100 text-rose-700",
        !["SCHEDULED", "SENT", "SENDING"].includes(props.status) &&
          !paused() &&
          !cancelled() &&
          "border-slate-300 bg-slate-200 text-slate-700",
      ])}
    >
      {statusLabelMap[props.status]}
    </span>
  );
}

function CampaignActions(props: {
  campaign: CampaignViewModel;
  onStatusChanged: (campaignId: string, status: CampaignStatus) => void;
}) {
  const [activeAction, setActiveAction] = createSignal<CampaignAction | null>(null);
  const [confirmCancel, setConfirmCancel] = createSignal(false);
  const actions = () => getCampaignActions(props.campaign.status);

  async function perform(action: CampaignAction): Promise<void> {
    if (activeAction()) return;
    setActiveAction(action);
    try {
      const result = await mutateCampaign(action, props.campaign.id);
      if (result.error || !result.campaign) {
        showError("There was an error.");
        return;
      }
      props.onStatusChanged(result.campaign.id, result.campaign.status);
      setConfirmCancel(false);
      showInfo(
        action === "pause"
          ? "Campaign has been paused."
          : action === "resume"
            ? "Campaign has been resumed."
            : "Campaign has been cancelled.",
      );
    } catch {
      showError("There was an error.");
    } finally {
      setActiveAction(null);
    }
  }

  return (
    <Show when={hasAccess("CAMPAIGN_WRITE") && actions().length > 0}>
      <div class="flex flex-wrap items-center justify-end gap-2" aria-label="Campaign actions">
        <Show when={actions().includes("pause")}>
          <Button
            variant="secondary"
            disabled={activeAction() !== null}
            spinner={activeAction() === "pause"}
            onClick={() => void perform("pause")}
          >
            Pause
          </Button>
        </Show>
        <Show when={actions().includes("resume")}>
          <Button
            variant="secondary"
            disabled={activeAction() !== null}
            spinner={activeAction() === "resume"}
            onClick={() => void perform("resume")}
          >
            Resume
          </Button>
        </Show>
        <Show when={actions().includes("cancel")}>
          <Button
            class="text-rose-700"
            variant="secondary"
            disabled={activeAction() !== null}
            onClick={() => setConfirmCancel(true)}
          >
            Cancel
          </Button>
        </Show>
      </div>
      <Show when={confirmCancel()}>
        <div class="fixed inset-0 z-60 flex items-center justify-center">
          <button
            class="absolute inset-0 bg-slate-900/35"
            aria-label="Keep campaign"
            onClick={() => setConfirmCancel(false)}
          />
          <div
            class="relative z-10 mx-3 max-w-lg rounded-2xl border border-white/80 bg-white/95 p-5 shadow-xl"
            role="dialog"
            aria-modal="true"
          >
            <h2 class="text-lg font-semibold text-slate-800">Cancel campaign?</h2>
            <p class="mt-2 text-sm text-slate-600">Unsent messages will be cancelled. This cannot be undone.</p>
            <div class="mt-5 flex justify-end gap-2">
              <Button variant="secondary" disabled={activeAction() !== null} onClick={() => setConfirmCancel(false)}>
                Keep campaign
              </Button>
              <Button spinner={activeAction() === "cancel"} onClick={() => void perform("cancel")}>
                Cancel campaign
              </Button>
            </div>
          </div>
        </div>
      </Show>
    </Show>
  );
}

async function mutateCampaign(
  action: CampaignAction,
  id: string,
): Promise<{ campaign?: { id: string; status: CampaignStatus }; error: boolean }> {
  if (action === "pause") {
    const response = await graphqlClient.mutation(PauseCampaignDocument, { id });
    return { campaign: response.data?.pauseCampaign, error: Boolean(response.error) };
  }
  if (action === "resume") {
    const response = await graphqlClient.mutation(ResumeCampaignDocument, { id });
    return { campaign: response.data?.resumeCampaign, error: Boolean(response.error) };
  }
  const response = await graphqlClient.mutation(CancelCampaignDocument, { id });
  return { campaign: response.data?.cancelCampaign, error: Boolean(response.error) };
}

function Metric(props: { label: string; value: string; accent?: string }) {
  return (
    <div class="rounded-xl border border-white/80 bg-white/75 p-3 shadow-sm">
      <p class="text-xs text-slate-500">{props.label}</p>
      <p class={classes(["text-lg font-semibold text-slate-800", props.accent])}>{props.value}</p>
    </div>
  );
}

function percent(value: number, total: number): number {
  return total > 0 ? (value / total) * 100 : 0;
}
