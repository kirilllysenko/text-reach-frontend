import { CampaignsStore } from "$houdini";
import type { CampaignFilterInput, CampaignSortInput } from "$houdini/graphql/inputs";
import {
  accessorColumn,
  DatagridCore,
  filteringFeature,
  sortingFeature,
  type FilteringService,
  type SortingService,
} from "text-reach-frontend-library/components/table";
import { debounce } from "text-reach-frontend-library/utils/debounce";
import type { CampaignStatus, CampaignViewModel } from "./campaign-view-data";
import { buildCampaignRequest } from "./campaign-query";
import { campaignSortDefinitions, initialCampaignSorts } from "./sort/sort.svelte";
import { campaignFilterDefinitions } from "./filter/filter.svelte";
import { mergeContactGroupNames, toCampaignViewModel } from "./campaign-display";
import { createContext } from "svelte";

type MobileView = "list" | "details";
export type CampaignListMode = "schedule" | "history";

const DEFAULT_PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 250;
export class CampaignState {
  private readonly campaignsQuery = new CampaignsStore();
  loading = $state(true);
  loadingMore = $state(false);
  loadingError = $state<string | null>(null);
  campaigns = $state<CampaignViewModel[]>([]);
  selectedCampaignId = $state<string | null>(null);
  contactGroupNameById = $state<Record<string, string>>({});

  search = $state("");
  listMode = $state<CampaignListMode>("history");
  desktopExpanded = $state(false);
  filtersOpen = $state(false);
  sortOpen = $state(false);

  mobileView = $state<MobileView>("list");

  hasNextPage = $state(true);
  private nextCursor = $state<string | null>(null);
  private selectedTenantPhoneId = $state<string | null>(null);
  private requestVersion = 0;
  private readonly scheduleRefresh = debounce(() => {
    void this.resetAndLoadCampaignList();
  }, SEARCH_DEBOUNCE_MS);
  private readonly table = new DatagridCore<CampaignViewModel, CampaignSortInput, CampaignFilterInput>({
    columns: [
      accessorColumn<CampaignViewModel, "id", unknown>({
        accessorKey: "id",
        columnId: "id",
        header: "Campaign",
      }),
    ],
    data: [],
    features: [
      sortingFeature<CampaignSortInput>({
        definitions: campaignSortDefinitions,
        initialSorts: [...initialCampaignSorts],
      }),
      filteringFeature<CampaignFilterInput>({ definitions: campaignFilterDefinitions }),
    ],
  });
  readonly filtering: FilteringService<CampaignFilterInput> = this.table.handlers.filtering;
  readonly sorting: SortingService<CampaignSortInput> = this.table.handlers.sorting;

  selectedCampaign = $derived.by(() => {
    const selectedCampaignId = this.selectedCampaignId;
    if (!selectedCampaignId) {
      return undefined;
    }

    return this.campaigns.find((campaign) => campaign.id === selectedCampaignId);
  });

  activeFilterCount = $derived(this.filtering.getVisibleActiveFilterCount());

  sortChips = $derived.by(() =>
    this.sorting.sorts.map((rule, index) => {
      const sortId = this.sorting.getSortId(rule);
      const definition = this.sorting.sortDefinitions.find((current) => current.sortId === sortId);
      const direction = this.sorting.getSortDirection(rule) === "ascending" ? "ASC" : "DESC";
      return `#${index + 1} ${definition?.label ?? sortId} ${direction}`;
    }),
  );

  activeSortCount = $derived(this.sorting.sorts.length);

  selectedCampaignGroupNames = $derived.by(() => {
    if (!this.selectedCampaign) {
      return [];
    }

    return this.selectedCampaign.contactGroupIds.map((groupId) => this.contactGroupNameById[groupId] ?? groupId);
  });

  constructor(selectedTenantPhoneId: string | null = null, initialListMode: CampaignListMode = "history") {
    this.selectedTenantPhoneId = selectedTenantPhoneId;
    this.listMode = initialListMode;
    this.table.events.on("onFilterChange", this.handleTableChange);
    this.table.events.on("onSortingChange", this.handleTableChange);
    void this.load();
  }

  load = async (): Promise<void> => {
    await this.resetAndLoadCampaignList();
  };

  updateSearch = (value: string): void => {
    this.search = value;
    this.scheduleRefresh();
  };

  setListMode = (mode: CampaignListMode): void => {
    if (mode === this.listMode) {
      return;
    }

    this.listMode = mode;
    this.closeOverlays();
    void this.resetAndLoadCampaignList();
  };

  setPhoneFilter = (phoneId: string | null): void => {
    if (phoneId === this.selectedTenantPhoneId) {
      return;
    }

    this.selectedTenantPhoneId = phoneId;
    void this.resetAndLoadCampaignList();
  };

  selectCampaign = (campaignId: string): void => {
    this.selectedCampaignId = campaignId;
    if (this.desktopExpanded) {
      this.desktopExpanded = false;
      this.closeOverlays();
    }
  };

  openCampaignDetailsOnMobile = (campaignId: string): void => {
    this.selectCampaign(campaignId);
    this.mobileView = "details";
  };

  backToMobileList = (): void => {
    this.mobileView = "list";
  };

  toggleDesktopExpanded = (): void => {
    this.desktopExpanded = !this.desktopExpanded;
    if (!this.desktopExpanded) {
      this.closeOverlays();
    }
  };

  openFilters = (): void => {
    this.filtersOpen = !this.filtersOpen;
    if (this.filtersOpen) {
      this.sortOpen = false;
    }
  };

  openSort = (): void => {
    this.sortOpen = !this.sortOpen;
    if (this.sortOpen) {
      this.filtersOpen = false;
    }
  };

  closeOverlays = (): void => {
    this.filtersOpen = false;
    this.sortOpen = false;
  };

  loadMoreIfNeeded = async (lastVisibleIndex: number): Promise<void> => {
    if (!this.hasNextPage || this.loadingMore || this.loading) {
      return;
    }

    if (lastVisibleIndex < this.campaigns.length - 8) {
      return;
    }

    await this.loadCampaignPage();
  };

  isCampaignSelected = (campaignId: string): boolean => this.selectedCampaignId === campaignId;

  updateCampaignStatus = (campaignId: string, status: CampaignStatus): void => {
    this.campaigns = this.campaigns.map((campaign) =>
      campaign.id === campaignId ? { ...campaign, status } : campaign,
    );
  };

  dispose = (): void => {
    this.table.events.off("onFilterChange", this.handleTableChange);
    this.table.events.off("onSortingChange", this.handleTableChange);
    this.scheduleRefresh.cancel();
  };

  private handleTableChange = (): void => {
    void this.resetAndLoadCampaignList();
  };

  private async resetAndLoadCampaignList(): Promise<void> {
    this.requestVersion += 1;
    this.loading = true;
    this.loadingMore = false;
    this.loadingError = null;
    this.campaigns = [];
    this.hasNextPage = true;
    this.nextCursor = null;

    const version = this.requestVersion;
    await this.loadCampaignPage(version);

    while (this.selectedTenantPhoneId && this.hasNextPage && version === this.requestVersion) {
      await this.loadCampaignPage(version);
    }
  }

  private async loadCampaignPage(version = this.requestVersion): Promise<void> {
    if (this.loadingMore) {
      return;
    }

    if (!this.hasNextPage && this.campaigns.length > 0) {
      return;
    }

    this.loadingMore = this.campaigns.length > 0;
    const previousCursor = this.nextCursor;

    try {
      const response = await this.campaignsQuery.fetch({
        variables: buildCampaignRequest({
          pageSize: DEFAULT_PAGE_SIZE,
          cursor: this.nextCursor,
          filters: this.filtering.filters,
          listMode: this.listMode,
          search: this.search,
          sort: this.sorting.sorts,
        }),
      });
      if (version !== this.requestVersion) {
        return;
      }

      if (response.errors || !response.data) {
        this.handleCampaignLoadError();
        return;
      }

      const data = response.data.campaigns;
      for (const edge of data.edges) {
        this.contactGroupNameById = mergeContactGroupNames(this.contactGroupNameById, edge.node.contactGroups);
      }
      const newItems = data.edges
        .map((edge, index) => toCampaignViewModel(edge.node, this.campaigns.length + index))
        .filter((campaign) => !this.selectedTenantPhoneId || campaign.tenantPhoneId === this.selectedTenantPhoneId);

      const knownIds = this.campaigns.map((campaign: CampaignViewModel) => campaign.id);
      const dedupedItems = newItems.filter((campaign: CampaignViewModel) => !knownIds.includes(campaign.id));

      this.campaigns = [...this.campaigns, ...dedupedItems];
      const nextCursor = data.pageInfo.endCursor ?? null;
      this.nextCursor = nextCursor;
      this.hasNextPage =
        data.pageInfo.hasNextPage && data.edges.length > 0 && nextCursor !== null && nextCursor !== previousCursor;
      this.ensureSelectedCampaign();
      this.loading = false;
      this.loadingMore = false;
    } catch {
      if (version !== this.requestVersion) {
        return;
      }

      this.handleCampaignLoadError();
    }
  }

  private handleCampaignLoadError(): void {
    this.loadingError = "Could not load campaigns.";
    this.campaigns = [];
    this.nextCursor = null;
    this.hasNextPage = false;
    this.ensureSelectedCampaign();
    this.loading = false;
    this.loadingMore = false;
  }

  private ensureSelectedCampaign(): void {
    if (!this.selectedCampaignId && this.campaigns.length > 0) {
      this.selectedCampaignId = this.campaigns[0]?.id ?? null;
      return;
    }

    if (!this.campaigns.some((campaign) => campaign.id === this.selectedCampaignId)) {
      this.selectedCampaignId = this.campaigns[0]?.id ?? null;
    }
  }
}

export const [getCampaignState, setCampaignState] = createContext<CampaignState>();
