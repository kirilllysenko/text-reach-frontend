import { CampaignsStore } from "$houdini";
import type { CampaignFilterInput, CampaignSortInput } from "$houdini/graphql/inputs";
import { DatagridCore, accessorColumn, type FilteringService, type SortingService } from "$lib/components/table";
import { debounce } from "$lib/utils/debounce";
import { toGraphQLErrorText } from "$lib/graphql/errors";
import type { CampaignViewModel } from "$lib/feature/campaign/campaign-view-data";
import { buildCampaignRequest } from "./campaign-query";
import { campaignSortDefinitions, initialCampaignSorts } from "./campaign-table-sorts";
import { campaignFilterDefinitions } from "./campaign-table-filters";
import { mergeContactGroupNames, toCampaignViewModel } from "./campaign-display";

type MobileView = "list" | "details";

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
  desktopExpanded = $state(false);
  filtersOpen = $state(false);
  sortOpen = $state(false);

  mobileView = $state<MobileView>("list");

  hasNextPage = $state(true);
  private nextCursor = $state<unknown[] | null>(null);
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
    initialState: {
      filtering: {
        filterDefinitions: campaignFilterDefinitions,
      },
      sorting: {
        sortDefinitions: campaignSortDefinitions,
        sorts: [...initialCampaignSorts],
      },
    },
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

  constructor() {
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

    await this.loadCampaignPage(this.requestVersion);
  }

  private async loadCampaignPage(version = this.requestVersion): Promise<void> {
    if (this.loadingMore) {
      return;
    }

    if (!this.hasNextPage && this.campaigns.length > 0) {
      return;
    }

    this.loadingMore = this.campaigns.length > 0;

    try {
      const response = await this.campaignsQuery.fetch({
        variables: buildCampaignRequest({
          pageSize: DEFAULT_PAGE_SIZE,
          cursor: this.nextCursor,
          filters: this.filtering.filters,
          search: this.search,
          sort: this.sorting.sorts,
        }),
      });
      if (version !== this.requestVersion) {
        return;
      }

      if (response.errors || !response.data) {
        this.handleCampaignLoadError(toGraphQLErrorText(response.errors));
        return;
      }

      const data = response.data.campaigns;
      for (const edge of data.edges) {
        this.contactGroupNameById = mergeContactGroupNames(this.contactGroupNameById, edge.node.contactGroups);
      }
      const newItems = data.edges.map((edge, index) => toCampaignViewModel(edge.node, this.campaigns.length + index));

      const knownIds = new Set(this.campaigns.map((campaign: CampaignViewModel) => campaign.id));
      const dedupedItems = newItems.filter((campaign: CampaignViewModel) => !knownIds.has(campaign.id));

      this.campaigns = [...this.campaigns, ...dedupedItems];
      this.nextCursor = data.pageInfo.endCursor ? [data.pageInfo.endCursor] : null;
      this.hasNextPage = data.pageInfo.hasNextPage && data.edges.length > 0;
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

  private handleCampaignLoadError(error?: string): void {
    this.loadingError = error ?? "Could not load campaigns from API.";
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
