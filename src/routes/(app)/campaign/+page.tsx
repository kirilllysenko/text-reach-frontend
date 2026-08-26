import { useSearchParams } from "@solidjs/router";
import { createEffect, For, onSettled, Show } from "solid-js";
import { VList } from "virtua/solid";
import type { CampaignStatus } from "~/gql/graphql";
import { PATH_CAMPAIGN_ADD } from "~/lib/app/paths";
import { Input, LinkButton, PageTitle } from "~/components";
import { campaignStatusOptions, statusLabelMap, type CampaignViewModel } from "~/lib/feature/campaign/campaign-data";
import { classes } from "~/lib/styles/classes";
import {
  campaignState,
  clearCampaignStatuses,
  closeCampaignMobileDetails,
  disposeCampaigns,
  initializeCampaigns,
  loadMoreCampaigns,
  reloadCampaigns,
  selectCampaign,
  selectedCampaign,
  selectedCampaignGroupNames,
  setCampaignListMode,
  setCampaignPhoneFilter,
  setCampaignSort,
  toggleCampaignStatus,
  updateCampaignSearch,
  updateCampaignStatus,
  type CampaignListMode,
  type CampaignSort,
} from "~/lib/state/campaign";
import { selectedPhoneId } from "~/lib/state/phone-filter";
import { hasAccess } from "~/lib/state/session";
import { CampaignDetails, CampaignStatusBadge } from "./components/CampaignDetails";

export default function CampaignPage() {
  const [searchParams] = useSearchParams();
  let mounted = false;
  const initialMode = (): CampaignListMode => (searchParams.view === "schedule" ? "schedule" : "history");

  onSettled(() => {
    initializeCampaigns(selectedPhoneId(), initialMode());
    mounted = true;
    return disposeCampaigns;
  });
  createEffect(selectedPhoneId, (phoneId) => {
    if (mounted) setCampaignPhoneFilter(phoneId);
  });

  return (
    <div class="relative flex h-dvh min-h-0 flex-col rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50 to-stone-100 p-2 sm:h-[calc(100dvh-3rem)] sm:p-3">
      <PageTitle title="Campaigns">
        <Show when={hasAccess("CAMPAIGN_WRITE")}>
          <LinkButton id="campaign-add" href={PATH_CAMPAIGN_ADD}>
            Create campaign
          </LinkButton>
        </Show>
      </PageTitle>

      <Show when={campaignState.loadingError}>
        {(error) => (
          <div class="text-amber-900 mb-3 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-100/90 px-3 py-2 text-sm">
            <span>{error()}</span>
            <button class="font-semibold underline" onClick={() => void reloadCampaigns()}>
              Try again
            </button>
          </div>
        )}
      </Show>

      <div class="grid min-h-0 grow overflow-hidden rounded-2xl border border-white/70 bg-white/70 shadow-[0_20px_45px_-25px_rgba(30,41,59,0.45)] backdrop-blur-md sm:grid-cols-[22rem_minmax(0,1fr)]">
        <aside
          class={classes([
            "flex min-h-0 flex-col border-r border-white/80",
            campaignState.mobileDetailsOpen ? "hidden sm:flex" : "flex",
          ])}
        >
          <CampaignToolbar />
          <div class="min-h-0 grow">
            <Show
              when={!campaignState.loading}
              fallback={<div class="grid h-full place-items-center text-sm text-slate-500">Loading campaigns…</div>}
            >
              <Show
                when={campaignState.campaigns.length > 0}
                fallback={<div class="grid h-full place-items-center text-sm text-slate-500">No campaigns found</div>}
              >
                <VList
                  data={campaignState.campaigns}
                  style={{ height: "100%" }}
                  itemSize={116}
                  onScrollEnd={() => void loadMoreCampaigns()}
                >
                  {(campaign) => <CampaignListItem campaign={campaign} />}
                </VList>
              </Show>
            </Show>
          </div>
          <Show when={campaignState.loadingMore}>
            <div class="border-t border-white/80 p-2 text-center text-xs text-slate-500">Loading more…</div>
          </Show>
        </aside>

        <main
          class={classes([
            "min-h-0 overflow-y-auto p-3 sm:p-5",
            campaignState.mobileDetailsOpen ? "block" : "hidden sm:block",
          ])}
        >
          <button
            class="mb-3 inline-flex items-center gap-1 text-sm font-medium text-sky-700 sm:hidden"
            type="button"
            onClick={closeCampaignMobileDetails}
          >
            ← Campaigns
          </button>
          <CampaignDetails
            campaign={selectedCampaign()}
            groupNames={selectedCampaignGroupNames()}
            onStatusChanged={updateCampaignStatus}
          />
        </main>
      </div>
    </div>
  );
}

function CampaignToolbar() {
  return (
    <div class="space-y-3 border-b border-white/80 p-3">
      <div class="grid grid-cols-2 rounded-xl bg-slate-200/70 p-1 text-sm">
        <button
          class={classes([
            "rounded-lg px-2 py-1.5",
            campaignState.listMode === "history" ? "bg-white font-medium shadow-sm" : "text-slate-600",
          ])}
          onClick={() => setCampaignListMode("history")}
        >
          History
        </button>
        <button
          class={classes([
            "rounded-lg px-2 py-1.5",
            campaignState.listMode === "schedule" ? "bg-white font-medium shadow-sm" : "text-slate-600",
          ])}
          onClick={() => setCampaignListMode("schedule")}
        >
          Scheduled
        </button>
      </div>
      <Input
        type="search"
        placeholder="Search campaigns"
        value={campaignState.search}
        onInput={(event) => updateCampaignSearch(event.currentTarget.value)}
      />
      <div class="grid grid-cols-2 gap-2">
        <select
          class="glass-input h-9 px-2 text-sm text-slate-700"
          value={campaignState.sort}
          aria-label="Sort campaigns"
          onChange={(event) => setCampaignSort(event.currentTarget.value as CampaignSort)}
        >
          <option value="newest">Newest</option>
          <option value="name">Name</option>
          <option value="messages">All messages</option>
          <option value="sent">Sent messages</option>
        </select>
        <details class="relative">
          <summary class="glass-input flex h-9 cursor-pointer items-center px-2 text-sm text-slate-700">
            Status{campaignState.statuses.length ? ` (${campaignState.statuses.length})` : ""}
          </summary>
          <div class="absolute top-10 right-0 z-20 w-64 space-y-1 rounded-xl border border-white bg-white p-3 shadow-xl">
            <For each={campaignStatusOptions}>
              {(status) => (
                <label class="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={campaignState.statuses.includes(status)}
                    onChange={() => toggleCampaignStatus(status)}
                  />
                  {statusLabelMap[status]}
                </label>
              )}
            </For>
            <Show when={campaignState.statuses.length > 0}>
              <button class="mt-2 text-sm font-medium text-sky-700" onClick={clearCampaignStatuses}>
                Clear
              </button>
            </Show>
          </div>
        </details>
      </div>
    </div>
  );
}

function CampaignListItem(props: { campaign: CampaignViewModel }) {
  const selected = () => campaignState.selectedCampaignId === props.campaign.id;
  return (
    <button
      type="button"
      class={classes([
        "m-2 flex min-h-25 w-[calc(100%-1rem)] flex-col gap-2 rounded-xl border p-3 text-left shadow-sm transition",
        selected() ? "border-sky-300 bg-sky-50/90" : "border-white/80 bg-white/75 hover:border-sky-200 hover:bg-white",
      ])}
      onClick={() => selectCampaign(props.campaign.id, true)}
    >
      <div class="flex w-full items-start justify-between gap-2">
        <span class="min-w-0 truncate font-semibold text-slate-800">{props.campaign.name}</span>
        <CampaignStatusBadge status={props.campaign.status} />
      </div>
      <p class="line-clamp-2 text-sm text-slate-500">{props.campaign.messageTemplate || "No message template"}</p>
      <div class="mt-auto flex justify-between text-xs text-slate-500">
        <span>
          {props.campaign.sentMessageCount}/{props.campaign.messageCount} sent
        </span>
        <a
          href={`/campaign/${props.campaign.id}/messages`}
          class="font-medium text-sky-700"
          onClick={(event) => event.stopPropagation()}
        >
          Messages
        </a>
      </div>
    </button>
  );
}
