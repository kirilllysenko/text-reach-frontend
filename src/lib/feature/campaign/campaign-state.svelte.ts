import {
  SortDirection,
  type CampaignDto,
  type ErrorResponse,
  type PageRequestContactGroupFilterDtoContactGroupSortDto,
} from "$lib/api/index.schemas";
import { fetchContactGroups as fetchContactGroupList } from "$lib/api/contact-group/contact-group";
import { listCampaigns as listCampaignList } from "$lib/api/campaign/campaign";
import type { DataTableActiveSortDirection, DataTableFilter, DataTableSort } from "$lib/components/table";
import { debounce } from "$lib/utils/debounce";
import {
  campaignSortFieldOptions,
  campaignStatusOptions,
  sortFieldLabelMap,
  statusLabelMap,
  type CampaignSortField,
  type CampaignStatus,
  type CampaignViewModel,
  type SortRule,
} from "$lib/feature/campaign/campaign-view-data";
import { buildCampaignRequest } from "./campaign-query";
import {
  createMockCampaignList,
  defaultContactGroupNameById,
  mergeContactGroupNames,
  toCampaignViewModel,
} from "./campaign-display";

type MobileView = "list" | "details";

const DEFAULT_PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 250;

export class CampaignState {
  loading = $state(true);
  loadingMore = $state(false);
  loadingError = $state<string | null>(null);
  campaigns = $state<CampaignViewModel[]>([]);
  selectedCampaignId = $state<string | null>(null);
  contactGroupNameById = $state<Record<string, string>>({ ...defaultContactGroupNameById });

  search = $state("");
  statusFilters = $state<NonNullable<CampaignStatus>[]>([]);
  createdAfter = $state("");
  minSentMessageCount = $state("");
  minMessageCount = $state("");
  sortRules = $state<SortRule[]>([
    {
      id: crypto.randomUUID(),
      field: "createdAt",
      direction: SortDirection.DESC,
    },
  ]);

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

  statusOptions = campaignStatusOptions;
  sortFieldOptions = campaignSortFieldOptions;

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
    this.sortRules.map((rule, index) => `#${index + 1} ${sortFieldLabelMap[rule.field]} ${rule.direction}`),
  );

  activeSortCount = $derived(this.sortRules.length);

  selectedCampaignGroupNames = $derived.by(() => {
    if (!this.selectedCampaign) {
      return [];
    }

    return this.selectedCampaign.contactGroupIds.map((groupId) => this.contactGroupNameById[groupId] ?? groupId);
  });

  constructor() {
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

  get sorts(): DataTableSort[] {
    return this.sortRules.map((rule) => ({
      direction: rule.direction === SortDirection.ASC ? "ascending" : "descending",
      sortId: rule.field,
    }));
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

  addSort = (sortId: string, direction: DataTableActiveSortDirection = "ascending"): void => {
    if (!this.isCampaignSortField(sortId)) {
      return;
    }

    this.setSorts([
      ...this.sorts.filter((sort) => sort.sortId !== sortId),
      {
        direction,
        sortId,
      },
    ]);
  };

  removeSortAt = (index: number): void => {
    this.setSorts(this.sorts.filter((_, currentIndex) => currentIndex !== index));
  };

  updateSortDirection = (index: number, direction: DataTableActiveSortDirection): void => {
    this.setSorts(this.sorts.map((sort, currentIndex) => (currentIndex === index ? { ...sort, direction } : sort)));
  };

  updateSortId = (index: number, sortId: string): void => {
    if (!this.isCampaignSortField(sortId)) {
      return;
    }

    this.setSorts(this.sorts.map((sort, currentIndex) => (currentIndex === index ? { ...sort, sortId } : sort)));
  };

  clearSorts = (): void => {
    this.setSorts([]);
  };

  setSorts = (sorts: DataTableSort[]): void => {
    this.applyFeatureSorts(sorts);
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

  statusLabel = (status: NonNullable<CampaignStatus>): string => statusLabelMap[status];

  dispose = (): void => {
    this.scheduleRefresh.cancel();
  };

  private setFilters(filters: DataTableFilter[]): void {
    this.applyFeatureFilters(filters);
    void this.resetAndLoadCampaignList();
  }

  private isCampaignSortField(sortId: string): sortId is CampaignSortField {
    return this.sortFieldOptions.includes(sortId as CampaignSortField);
  }

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

  private applyFeatureSorts(sorts: DataTableSort[]): void {
    const sortableFields = new Set<CampaignSortField>(this.sortFieldOptions);
    const sortRules = sorts
      .filter((sort): sort is DataTableSort & { sortId: CampaignSortField } =>
        sortableFields.has(sort.sortId as CampaignSortField),
      )
      .map((sort) => ({
        id: sort.sortId,
        field: sort.sortId,
        direction: sort.direction === "ascending" ? SortDirection.ASC : SortDirection.DESC,
      }));

    this.sortRules =
      sortRules.length > 0
        ? sortRules
        : [{ id: crypto.randomUUID(), field: "createdAt", direction: SortDirection.DESC }];
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
          sortRules: this.sortRules,
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
    this.loadingError =
      error?.errorDescription ?? "Could not load campaigns from API, so the page is showing local preview data.";
    this.campaigns = createMockCampaignList();
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
