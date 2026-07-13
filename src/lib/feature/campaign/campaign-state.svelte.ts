import {
  SortDirection,
  type CampaignDto,
  type ErrorResponse,
  type PageRequestContactGroupFilterDtoContactGroupSortDto,
} from "$lib/api/index.schemas";
import { fetchContactGroups as fetchContactGroupList } from "$lib/api/contact-group/contact-group";
import { listCampaigns as listCampaignList } from "$lib/api/campaign/campaign";
import { DatagridCore, accessorColumn, type DataTableFilter, type SortingService } from "$lib/components/table";
import { debounce } from "$lib/utils/debounce";
import {
  campaignStatusOptions,
  statusLabelMap,
  type CampaignStatus,
  type CampaignViewModel,
} from "$lib/feature/campaign/campaign-view-data";
import { buildCampaignRequest } from "./campaign-query";
import { campaignTableSorts } from "./campaign-table-sorts";
import { mergeContactGroupNames, toCampaignViewModel } from "./campaign-display";

type MobileView = "list" | "details";

const DEFAULT_PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 250;
const INITIAL_SORTING = [{ sortId: "createdAt", direction: "descending" }] as const;

export class CampaignState {
  loading = $state(true);
  loadingMore = $state(false);
  loadingError = $state<string | null>(null);
  campaigns = $state<CampaignViewModel[]>([]);
  selectedCampaignId = $state<string | null>(null);
  contactGroupNameById = $state<Record<string, string>>({});

  search = $state("");
  statusFilters = $state<NonNullable<CampaignStatus>[]>([]);
  createdAfter = $state("");
  minSentMessageCount = $state("");
  minMessageCount = $state("");
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
  private readonly sortingTable = new DatagridCore<CampaignViewModel>({
    columns: [
      accessorColumn<CampaignViewModel, "id", unknown>({
        accessorKey: "id",
        columnId: "id",
        header: "Campaign",
      }),
    ],
    data: [],
    initialState: {
      sorting: {
        sortDefinitions: campaignTableSorts.definitions,
        sorts: [...INITIAL_SORTING],
      },
    },
  });
  readonly sorting: SortingService = this.sortingTable.handlers.sorting;

  statusOptions = campaignStatusOptions;
  selectedCampaign = $derived.by(() => {
    const selectedCampaignId = this.selectedCampaignId;
    if (!selectedCampaignId) {
      return undefined;
    }

    return this.campaigns.find((campaign) => campaign.id === selectedCampaignId);
  });

  activeFilterChips = $derived.by(() => {
    const chips: string[] = [];

    if (this.statusFilters.length > 0) {
      chips.push(`Status: ${this.statusFilters.map((status) => this.statusLabel(status)).join(", ")}`);
    }

    if (this.createdAfter) {
      chips.push(`Created after: ${this.createdAfter}`);
    }

    if (this.minSentMessageCount) {
      chips.push(`Min sent: ${this.minSentMessageCount}`);
    }

    if (this.minMessageCount) {
      chips.push(`Min all messages: ${this.minMessageCount}`);
    }

    return chips;
  });

  activeFilterCount = $derived(this.activeFilterChips.length);

  sortChips = $derived.by(() =>
    this.sorting.sorts.map((rule, index) => {
      const definition = this.sorting.sortDefinitions.find((current) => current.sortId === rule.sortId);
      const direction = rule.direction === "ascending" ? "ASC" : "DESC";
      return `#${index + 1} ${definition?.label ?? rule.sortId} ${direction}`;
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
    this.sortingTable.events.on("onSortingChange", this.handleSortingChange);
    void this.load();
  }

  get filters(): DataTableFilter[] {
    const filters: DataTableFilter[] = [];

    if (this.statusFilters.length > 0) {
      filters.push({
        filterId: "status",
        operator: "IN",
        type: "containment",
        value: this.statusFilters,
      });
    }

    if (this.createdAfter) {
      filters.push({
        filterId: "createdAfter",
        operator: "GREATER_OR_EQUAL",
        type: "comparison",
        value: this.createdAfter,
      });
    }

    if (this.minSentMessageCount) {
      filters.push({
        filterId: "minSentMessageCount",
        operator: "GREATER_OR_EQUAL",
        type: "comparison",
        value: Number(this.minSentMessageCount),
      });
    }

    if (this.minMessageCount) {
      filters.push({
        filterId: "minMessageCount",
        operator: "GREATER_OR_EQUAL",
        type: "comparison",
        value: Number(this.minMessageCount),
      });
    }

    return filters;
  }

  load = async (): Promise<void> => {
    await Promise.all([this.loadContactGroupList(), this.resetAndLoadCampaignList()]);
  };

  updateSearch = (value: string): void => {
    this.search = value;
    this.scheduleRefresh();
  };

  setFilter = (filterId: string, filter: DataTableFilter): void => {
    this.setFilters([...this.filters.filter((current) => current.filterId !== filterId), { ...filter, filterId }]);
  };

  removeFilter = (filterId: string): void => {
    this.setFilters(this.filters.filter((filter) => filter.filterId !== filterId));
  };

  clearFilters = (): void => {
    this.setFilters([]);
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

  statusLabel = (status: NonNullable<CampaignStatus>): string => statusLabelMap[status];

  dispose = (): void => {
    this.sortingTable.events.off("onSortingChange", this.handleSortingChange);
    this.scheduleRefresh.cancel();
  };

  private setFilters(filters: DataTableFilter[]): void {
    this.applyFeatureFilters(filters);
    void this.resetAndLoadCampaignList();
  }

  private handleSortingChange = (): void => {
    void this.resetAndLoadCampaignList();
  };

  private applyFeatureFilters(filters: DataTableFilter[]): void {
    const statusFilter = filters.find(
      (filter) => filter.type === "containment" && filter.filterId === "status" && filter.operator === "IN",
    );
    const createdAfterFilter = filters.find(
      (filter) =>
        filter.type === "comparison" && filter.filterId === "createdAfter" && filter.operator === "GREATER_OR_EQUAL",
    );
    const minSentFilter = filters.find(
      (filter) =>
        filter.type === "comparison" &&
        filter.filterId === "minSentMessageCount" &&
        filter.operator === "GREATER_OR_EQUAL",
    );
    const minAllFilter = filters.find(
      (filter) =>
        filter.type === "comparison" && filter.filterId === "minMessageCount" && filter.operator === "GREATER_OR_EQUAL",
    );

    this.statusFilters =
      statusFilter?.type === "containment" ? (statusFilter.value as NonNullable<CampaignStatus>[]) : [];
    this.createdAfter =
      createdAfterFilter?.type === "comparison" && typeof createdAfterFilter.value === "string"
        ? createdAfterFilter.value
        : "";
    this.minSentMessageCount =
      minSentFilter?.type === "comparison" && typeof minSentFilter.value !== "undefined"
        ? String(minSentFilter.value)
        : "";
    this.minMessageCount =
      minAllFilter?.type === "comparison" && typeof minAllFilter.value !== "undefined"
        ? String(minAllFilter.value)
        : "";
  }

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
      const response = await listCampaignList(
        buildCampaignRequest({
          pageSize: DEFAULT_PAGE_SIZE,
          cursor: this.nextCursor,
          search: this.search,
          statusFilters: this.statusFilters,
          createdAfter: this.createdAfter,
          minSentMessageCount: this.minSentMessageCount,
          minMessageCount: this.minMessageCount,
          sort: campaignTableSorts.toBackend(this.sorting.sorts),
        }),
      );
      if (version !== this.requestVersion) {
        return;
      }

      if (response.status !== 200) {
        this.handleCampaignLoadError(response.data as ErrorResponse);
        return;
      }

      const data = response.data as { items?: CampaignDto[]; nextCursor?: unknown[] };
      const newItems = (data.items ?? []).map((item: CampaignDto, index: number) =>
        toCampaignViewModel(item, this.campaigns.length + index),
      );

      const knownIds = new Set(this.campaigns.map((campaign: CampaignViewModel) => campaign.id));
      const dedupedItems = newItems.filter((campaign: CampaignViewModel) => !knownIds.has(campaign.id));

      this.campaigns = [...this.campaigns, ...dedupedItems];
      this.nextCursor = data.nextCursor ?? null;
      this.hasNextPage = !!data.nextCursor && (data.items?.length ?? 0) > 0;
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

  private handleCampaignLoadError(error?: ErrorResponse): void {
    this.loadingError = error?.errorDescription ?? "Could not load campaigns from API.";
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

  private async loadContactGroupList(): Promise<void> {
    const request: PageRequestContactGroupFilterDtoContactGroupSortDto = {
      pageSize: 300,
      sort: {
        name: {
          order: 0,
          direction: SortDirection.ASC,
        },
      },
    };

    const response = await fetchContactGroupList(request, { credentials: "include" });
    if (response.status !== 200) {
      return;
    }

    this.contactGroupNameById = mergeContactGroupNames(this.contactGroupNameById, response.data.items ?? []);
  }
}
