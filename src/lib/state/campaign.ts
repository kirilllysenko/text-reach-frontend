import { createStore } from "~/lib/state/store";
import {
  CampaignsDocument,
  type CampaignFilterInput,
  type CampaignSortInput,
  type CampaignStatus,
} from "~/gql/graphql";
import {
  mergeCampaignGroupNames,
  toCampaignViewModel,
  type CampaignViewModel,
} from "~/lib/feature/campaign/campaign-data";
import { graphqlClient } from "~/lib/graphql/client";

export type CampaignListMode = "schedule" | "history";
export type CampaignSort = "newest" | "name" | "messages" | "sent";

interface CampaignStore {
  campaigns: CampaignViewModel[];
  contactGroupNameById: Record<string, string>;
  hasNextPage: boolean;
  listMode: CampaignListMode;
  loading: boolean;
  loadingError: string | null;
  loadingMore: boolean;
  mobileDetailsOpen: boolean;
  search: string;
  selectedCampaignId: string | null;
  sort: CampaignSort;
  statuses: CampaignStatus[];
}

const initialState: CampaignStore = {
  campaigns: [],
  contactGroupNameById: {},
  hasNextPage: true,
  listMode: "history",
  loading: true,
  loadingError: null,
  loadingMore: false,
  mobileDetailsOpen: false,
  search: "",
  selectedCampaignId: null,
  sort: "newest",
  statuses: [],
};

export const [campaignState, setCampaignState] = createStore<CampaignStore>({ ...initialState });

let nextCursor: string | null = null;
let selectedTenantPhoneId: string | null = null;
let requestVersion = 0;
let searchTimer: ReturnType<typeof setTimeout> | undefined;

export function selectedCampaign(): CampaignViewModel | undefined {
  return campaignState.campaigns.find((campaign) => campaign.id === campaignState.selectedCampaignId);
}

export function selectedCampaignGroupNames(): string[] {
  return selectedCampaign()?.contactGroupIds.map((id) => campaignState.contactGroupNameById[id] ?? id) ?? [];
}

export function initializeCampaigns(phoneId: string | null, mode: CampaignListMode): void {
  disposeCampaigns();
  selectedTenantPhoneId = phoneId;
  setCampaignState({ ...initialState, listMode: mode });
  void reloadCampaigns();
}

export function disposeCampaigns(): void {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = undefined;
  requestVersion += 1;
}

export function updateCampaignSearch(value: string): void {
  setCampaignState("search", value);
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => void reloadCampaigns(), 250);
}

export function setCampaignListMode(mode: CampaignListMode): void {
  if (mode === campaignState.listMode) return;
  setCampaignState("listMode", mode);
  void reloadCampaigns();
}

export function setCampaignSort(sort: CampaignSort): void {
  if (sort === campaignState.sort) return;
  setCampaignState("sort", sort);
  void reloadCampaigns();
}

export function toggleCampaignStatus(status: CampaignStatus): void {
  setCampaignState("statuses", (statuses) =>
    statuses.includes(status) ? statuses.filter((current) => current !== status) : [...statuses, status],
  );
  void reloadCampaigns();
}

export function clearCampaignStatuses(): void {
  setCampaignState("statuses", []);
  void reloadCampaigns();
}

export function setCampaignPhoneFilter(phoneId: string | null): void {
  if (phoneId === selectedTenantPhoneId) return;
  selectedTenantPhoneId = phoneId;
  void reloadCampaigns();
}

export function selectCampaign(campaignId: string, openMobile = false): void {
  setCampaignState({ selectedCampaignId: campaignId, mobileDetailsOpen: openMobile });
}

export function closeCampaignMobileDetails(): void {
  setCampaignState("mobileDetailsOpen", false);
}

export function updateCampaignStatus(campaignId: string, status: CampaignStatus): void {
  setCampaignState(
    "campaigns",
    campaignState.campaigns.map((campaign) => (campaign.id === campaignId ? { ...campaign, status } : campaign)),
  );
}

export async function reloadCampaigns(): Promise<void> {
  const version = ++requestVersion;
  nextCursor = null;
  setCampaignState({ campaigns: [], hasNextPage: true, loading: true, loadingError: null, loadingMore: false });
  await Promise.resolve();
  await loadCampaignPage(version);
  while (selectedTenantPhoneId && campaignState.hasNextPage && version === requestVersion) {
    await loadCampaignPage(version);
  }
}

export async function loadMoreCampaigns(): Promise<void> {
  if (campaignState.loading || campaignState.loadingMore || !campaignState.hasNextPage) return;
  await loadCampaignPage(requestVersion);
}

async function loadCampaignPage(version: number): Promise<void> {
  if (campaignState.loadingMore || (!campaignState.hasNextPage && campaignState.campaigns.length > 0)) return;
  const previousCursor = nextCursor;
  setCampaignState("loadingMore", campaignState.campaigns.length > 0);
  try {
    const response = await graphqlClient.query(
      CampaignsDocument,
      {
        after: nextCursor,
        filter: campaignFilter(),
        first: 50,
        sortBy: campaignSort(),
      },
      { requestPolicy: "network-only" },
    );
    if (version !== requestVersion) return;
    if (response.error || !response.data) throw new Error();

    let groupNames = campaignState.contactGroupNameById;
    for (const edge of response.data.campaigns.edges) {
      groupNames = mergeCampaignGroupNames(groupNames, edge.node.contactGroups);
    }
    const incoming = response.data.campaigns.edges
      .map((edge) => toCampaignViewModel(edge.node))
      .filter((campaign) => !selectedTenantPhoneId || campaign.tenantPhoneId === selectedTenantPhoneId);
    const knownIds = new Set(campaignState.campaigns.map((campaign) => campaign.id));
    const campaigns = [...campaignState.campaigns, ...incoming.filter((campaign) => !knownIds.has(campaign.id))];
    nextCursor = response.data.campaigns.pageInfo.endCursor ?? null;
    setCampaignState({
      campaigns,
      contactGroupNameById: groupNames,
      hasNextPage:
        response.data.campaigns.pageInfo.hasNextPage &&
        response.data.campaigns.edges.length > 0 &&
        nextCursor !== null &&
        nextCursor !== previousCursor,
      loading: false,
      loadingMore: false,
      loadingError: null,
      selectedCampaignId: campaigns.some((campaign) => campaign.id === campaignState.selectedCampaignId)
        ? campaignState.selectedCampaignId
        : (campaigns[0]?.id ?? null),
    });
  } catch {
    if (version !== requestVersion) return;
    setCampaignState({
      campaigns: [],
      hasNextPage: false,
      loading: false,
      loadingMore: false,
      loadingError: "Could not load campaigns.",
      selectedCampaignId: null,
    });
  }
}

function campaignFilter(): CampaignFilterInput {
  const nested: CampaignFilterInput[] = [
    {
      status: campaignState.listMode === "schedule" ? { in: ["SCHEDULED"] } : { notIn: ["SCHEDULED"] },
    },
  ];
  const search = campaignState.search.trim();
  if (search) {
    nested.push({
      operator: "OR",
      nested: [{ name: { contains: search } }, { messageTemplate: { contains: search } }],
    });
  }
  if (campaignState.statuses.length > 0) nested.push({ status: { in: [...campaignState.statuses] } });
  return { operator: "AND", nested };
}

function campaignSort(): CampaignSortInput[] {
  const direction = { direction: "DESC" as const };
  if (campaignState.sort === "name") return [{ name: { direction: "ASC" } }];
  if (campaignState.sort === "messages") return [{ messageCount: direction }];
  if (campaignState.sort === "sent") return [{ sentMessageCount: direction }];
  return [{ createdAt: direction }];
}
