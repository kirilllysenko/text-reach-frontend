import {
  SortDirection,
  type CampaignDto,
  type ErrorResponse,
  type PageRequestContactGroupFilterDtoContactGroupSortDto,
} from "$lib/api/index.schemas";
import { fetchContactGroups } from "$lib/api/contact-group/contact-group";
import { listCampaigns } from "$lib/api/campaign/campaign";
import {
  DataTableCore,
  FiltersFeature,
  SortingFeature,
  type DataTableFilter,
  type DataTableSort,
} from "$lib/components/table";
import {
  campaignSortFieldOptions,
  campaignStatusOptions,
  sortFieldLabelMap,
  statusLabelMap,
  type CampaignSortField,
  type CampaignStatus,
  type CampaignViewModel,
  type SortRule,
} from "$lib/features/campaigns/campaigns-view-data";
import { buildCampaignRequest } from "./campaigns-query";
import {
  createMockCampaigns,
  defaultContactGroupNameById,
  mergeContactGroupNames,
  toCampaignViewModel,
} from "./campaigns-display";

type MobileView = "list" | "details";

const DEFAULT_PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 250;

export class CampaignsState {
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
  readonly filters: FiltersFeature;
  readonly sorting: SortingFeature;

  hasNextPage = $state(true);
  private readonly tableFeatureHost = new DataTableCore<CampaignViewModel>({});
  private nextCursor = $state<unknown[] | null>(null);
  private requestVersion = 0;
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

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
    this.filters = new FiltersFeature([], this.tableFeatureHost.events);
    this.sorting = new SortingFeature(this.tableFeatureHost.events, [
      {
        direction: "descending",
        sortId: "createdAt",
      },
    ]);
    this.tableFeatureHost.addDisposer(
      this.tableFeatureHost.events.on("filterChange", (filters) => {
        this.applyFeatureFilters(filters);
        void this.resetAndLoadCampaigns();
      }),
    );
    this.tableFeatureHost.addDisposer(
      this.tableFeatureHost.events.on("sortChange", (sorts) => {
        this.applyFeatureSorts(sorts);
        void this.resetAndLoadCampaigns();
      }),
    );
    void this.load();
  }

  load = async (): Promise<void> => {
    await Promise.all([this.loadContactGroups(), this.resetAndLoadCampaigns()]);
  };

  updateSearch = (value: string): void => {
    this.search = value;
    this.scheduleRefresh();
  };

  toggleStatusFilter = (status: NonNullable<CampaignStatus>): void => {
    this.statusFilters = this.statusFilters.includes(status)
      ? this.statusFilters.filter((value) => value !== status)
      : [...this.statusFilters, status];

    void this.resetAndLoadCampaigns();
  };

  updateCreatedAfter = (value: string): void => {
    this.createdAfter = value;
    void this.resetAndLoadCampaigns();
  };

  updateMinSentMessageCount = (value: string): void => {
    this.minSentMessageCount = value;
    void this.resetAndLoadCampaigns();
  };

  updateMinMessageCount = (value: string): void => {
    this.minMessageCount = value;
    void this.resetAndLoadCampaigns();
  };

  clearFilters = (): void => {
    this.statusFilters = [];
    this.createdAfter = "";
    this.minSentMessageCount = "";
    this.minMessageCount = "";
    void this.resetAndLoadCampaigns();
  };

  addSortRule = (): void => {
    const usedFields = new Set(this.sortRules.map((rule) => rule.field));
    const field = this.sortFieldOptions.find((option) => !usedFields.has(option)) ?? this.sortFieldOptions[0];

    this.sortRules = [
      ...this.sortRules,
      {
        id: crypto.randomUUID(),
        field,
        direction: SortDirection.DESC,
      },
    ];

    void this.resetAndLoadCampaigns();
  };

  removeSortRule = (ruleId: string): void => {
    const remaining = this.sortRules.filter((rule) => rule.id !== ruleId);
    this.sortRules =
      remaining.length > 0
        ? remaining
        : [{ id: crypto.randomUUID(), field: "createdAt", direction: SortDirection.DESC }];

    void this.resetAndLoadCampaigns();
  };

  updateSortRuleField = (ruleId: string, field: CampaignSortField): void => {
    this.sortRules = this.sortRules.map((rule) => (rule.id === ruleId ? { ...rule, field } : rule));
    void this.resetAndLoadCampaigns();
  };

  updateSortRuleDirection = (ruleId: string, direction: SortDirection): void => {
    this.sortRules = this.sortRules.map((rule) => (rule.id === ruleId ? { ...rule, direction } : rule));
    void this.resetAndLoadCampaigns();
  };

  clearSortRules = (): void => {
    this.sortRules = [{ id: crypto.randomUUID(), field: "createdAt", direction: SortDirection.DESC }];
    void this.resetAndLoadCampaigns();
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
    this.tableFeatureHost.dispose();

    if (!this.searchTimer) {
      return;
    }

    clearTimeout(this.searchTimer);
    this.searchTimer = null;
  };

  private scheduleRefresh(): void {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }

    this.searchTimer = setTimeout(() => {
      void this.resetAndLoadCampaigns();
    }, SEARCH_DEBOUNCE_MS);
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

  private async resetAndLoadCampaigns(): Promise<void> {
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
      const response = await listCampaigns(
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
    this.campaigns = createMockCampaigns();
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

  private async loadContactGroups(): Promise<void> {
    const request: PageRequestContactGroupFilterDtoContactGroupSortDto = {
      pageSize: 300,
      sort: {
        name: {
          order: 0,
          direction: SortDirection.ASC,
        },
      },
    };

    const response = await fetchContactGroups(request, { credentials: "include" });
    if (response.status !== 200) {
      return;
    }

    this.contactGroupNameById = mergeContactGroupNames(this.contactGroupNameById, response.data.items ?? []);
  }
}
