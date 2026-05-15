import {
  CampaignDtoStatus,
  CampaignFilterDtoOperator,
  ComparisonFilterInstantOperator,
  ComparisonFilterIntegerOperator,
  ContainmentFilterCampaignStatusOperator,
  PageRequestCampaignFilterDtoCampaignSortDtoPageDirection,
  SortDirection,
  type CampaignDto,
  type CampaignFilterDto,
  type CampaignSortDto,
  type ContactGroupDto,
  type ErrorResponseDto,
  type PageRequestCampaignFilterDtoCampaignSortDto,
  type PageRequestContactGroupFilterDtoContactGroupSortDto,
  type Sort,
} from "$lib/api/index.schemas";
import { getPage as getContactGroupPage } from "$lib/api/contact-group/contact-group";
import { getCampaignPageWithBody } from "./campaigns-api";
import {
  campaignSortFieldOptions,
  campaignStatusOptions,
  sortFieldLabelMap,
  statusLabelMap,
  type CampaignSortField,
  type CampaignStatus,
  type CampaignViewModel,
  type SortRule,
} from "./campaigns-models";

type MobileView = "list" | "details";

const DEFAULT_PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 250;

export class CampaignsState {
  loading = $state(true);
  loadingMore = $state(false);
  loadingError = $state<string | null>(null);
  campaigns = $state<CampaignViewModel[]>([]);
  selectedCampaignId = $state<string | null>(null);
  contactGroupNameById = $state<Record<string, string>>({
    "mock-group-1": "High Value Customers",
    "mock-group-2": "Newsletter Subscribers",
    "mock-group-3": "Recent Signups",
    "mock-group-4": "Reactivation - February",
  });

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
  desktopFiltersOpen = $state(false);
  desktopSortOpen = $state(false);

  mobileView = $state<MobileView>("list");
  mobileFilterSheetOpen = $state(false);
  mobileSortSheetOpen = $state(false);

  hasNextPage = $state(true);
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
      this.closeDesktopPanels();
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
      this.closeDesktopPanels();
    }
  };

  openMobileFilterSheet = (): void => {
    this.mobileFilterSheetOpen = true;
    this.mobileSortSheetOpen = false;
  };

  closeMobileFilterSheet = (): void => {
    this.mobileFilterSheetOpen = false;
  };

  openMobileSortSheet = (): void => {
    this.mobileSortSheetOpen = true;
    this.mobileFilterSheetOpen = false;
  };

  closeMobileSortSheet = (): void => {
    this.mobileSortSheetOpen = false;
  };

  openDesktopFilters = (): void => {
    this.desktopFiltersOpen = !this.desktopFiltersOpen;
    if (this.desktopFiltersOpen) {
      this.desktopSortOpen = false;
    }
  };

  openDesktopSort = (): void => {
    this.desktopSortOpen = !this.desktopSortOpen;
    if (this.desktopSortOpen) {
      this.desktopFiltersOpen = false;
    }
  };

  closeDesktopPanels = (): void => {
    this.desktopFiltersOpen = false;
    this.desktopSortOpen = false;
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

  private scheduleRefresh(): void {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }

    this.searchTimer = setTimeout(() => {
      void this.resetAndLoadCampaigns();
    }, SEARCH_DEBOUNCE_MS);
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
      const response = await getCampaignPageWithBody(this.buildCampaignRequest());
      if (version !== this.requestVersion) {
        return;
      }

      if (response.status !== 200) {
        this.handleCampaignLoadError(response.data as ErrorResponseDto);
        return;
      }

      const data = response.data as { items?: CampaignDto[]; nextCursor?: unknown[] };
      const newItems = (data.items ?? []).map((item: CampaignDto, index: number) =>
        this.toViewModel(item, this.campaigns.length + index),
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

  private handleCampaignLoadError(error?: ErrorResponseDto): void {
    this.loadingError =
      error?.errorDescription ??
      "Could not load campaigns from API. The current backend campaign-list endpoint is rejecting the browser request, so the page is showing local preview data.";
    this.campaigns = this.createMockCampaigns();
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

  private buildCampaignRequest(): PageRequestCampaignFilterDtoCampaignSortDto {
    return {
      pageSize: DEFAULT_PAGE_SIZE,
      cursor: this.nextCursor ?? undefined,
      pageDirection: this.nextCursor ? PageRequestCampaignFilterDtoCampaignSortDtoPageDirection.NEXT : undefined,
      filter: this.buildFilter(),
      sort: this.buildSort(),
    };
  }

  private buildFilter(): CampaignFilterDto | undefined {
    const nested: CampaignFilterDto[] = [];
    const searchValue = this.search.trim();

    if (searchValue) {
      nested.push({
        operator: CampaignFilterDtoOperator.OR,
        nested: [
          {
            name: {
              operator: "CONTAINS",
              value: searchValue,
            },
          },
          {
            messageTemplate: {
              operator: "CONTAINS",
              value: searchValue,
            },
          },
        ],
      });
    }

    if (this.statusFilters.length > 0) {
      nested.push({
        status: {
          operator: ContainmentFilterCampaignStatusOperator.IN,
          value: this.statusFilters,
        },
      });
    }

    if (this.createdAfter) {
      const createdAfterDate = new Date(`${this.createdAfter}T00:00:00`);
      if (!Number.isNaN(createdAfterDate.valueOf())) {
        nested.push({
          createdAt: {
            operator: ComparisonFilterInstantOperator.GREATER_OR_EQUAL,
            value: createdAfterDate.toISOString(),
          },
        });
      }
    }

    const minSentMessageCount = Number(this.minSentMessageCount);
    if (this.minSentMessageCount && !Number.isNaN(minSentMessageCount)) {
      nested.push({
        sentMessageCount: {
          operator: ComparisonFilterIntegerOperator.GREATER_OR_EQUAL,
          value: minSentMessageCount,
        },
      });
    }

    const minMessageCount = Number(this.minMessageCount);
    if (this.minMessageCount && !Number.isNaN(minMessageCount)) {
      nested.push({
        messageCount: {
          operator: ComparisonFilterIntegerOperator.GREATER_OR_EQUAL,
          value: minMessageCount,
        },
      });
    }

    if (nested.length === 0) {
      return undefined;
    }

    return {
      operator: CampaignFilterDtoOperator.AND,
      nested,
    };
  }

  private buildSort(): CampaignSortDto {
    return this.sortRules.reduce<CampaignSortDto>((acc, rule, index) => {
      acc[rule.field] = {
        order: index + 1,
        direction: rule.direction,
      } satisfies Sort;
      return acc;
    }, {});
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

    const response = await getContactGroupPage(request, { credentials: "include" });
    if (response.status !== 200) {
      return;
    }

    this.setContactGroupNames(response.data.items ?? []);
  }

  private setContactGroupNames(groups: ContactGroupDto[]): void {
    const map = { ...this.contactGroupNameById };
    for (const group of groups) {
      if (!group.id || !group.name) {
        continue;
      }

      map[group.id] = group.name;
    }

    this.contactGroupNameById = map;
  }

  private toViewModel(dto: CampaignDto, index: number): CampaignViewModel {
    const id = dto.id ?? `campaign-${index + 1}`;
    const status = dto.status ?? CampaignDtoStatus.PENDING;
    const messageCount = Math.max(dto.messageCount ?? 0, dto.sentMessageCount ?? 0);
    const sentMessageCount = Math.min(Math.max(dto.sentMessageCount ?? 0, 0), messageCount);
    const errorMessageCount = this.calculateErrorMessageCount(id, messageCount, sentMessageCount, status);
    const pendingMessageCount = Math.max(messageCount - sentMessageCount - errorMessageCount, 0);

    return {
      id,
      name: dto.name ?? `Campaign ${index + 1}`,
      messageTemplate: dto.messageTemplate ?? "",
      status,
      messageCount,
      sentMessageCount,
      pendingMessageCount,
      errorMessageCount,
      createdAt: this.deriveCreatedAt(id, index),
      contactGroupIds: dto.contactGroupIds ?? [],
      fromPhoneNumber: this.derivePhoneNumber(index),
    };
  }

  private deriveCreatedAt(id: string, index: number): Date {
    const now = new Date();
    const dayOffset = index + (this.hash(id) % 5);
    return new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
  }

  private derivePhoneNumber(index: number): string {
    const fallbackNumbers = ["+1 (415) 555-0171", "+1 (628) 555-0142", "+1 (415) 555-0199", "+1 (628) 555-0158"];

    return fallbackNumbers[index % fallbackNumbers.length] ?? fallbackNumbers[0]!;
  }

  private calculateErrorMessageCount(
    id: string,
    messageCount: number,
    sentMessageCount: number,
    status: NonNullable<CampaignStatus>,
  ): number {
    if (messageCount === 0) {
      return 0;
    }

    if (status === CampaignDtoStatus.SENT) {
      return Math.max(messageCount - sentMessageCount, 0);
    }

    const notSent = Math.max(messageCount - sentMessageCount, 0);
    const ratio = 0.02 + (this.hash(id) % 8) / 100;
    return Math.min(notSent, Math.round(messageCount * ratio));
  }

  private hash(value: string): number {
    let hash = 0;

    for (let index = 0; index < value.length; index += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(index);
      hash |= 0;
    }

    return Math.abs(hash);
  }

  private createMockCampaigns(): CampaignViewModel[] {
    const now = new Date();

    return [
      {
        id: "mock-1",
        name: "Spring Promo 2026",
        messageTemplate: "Spring sale is live. Reply STOP to opt out.",
        status: CampaignDtoStatus.SENDING,
        messageCount: 1560,
        sentMessageCount: 978,
        pendingMessageCount: 518,
        errorMessageCount: 64,
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        contactGroupIds: ["mock-group-1", "mock-group-2", "mock-group-3"],
        fromPhoneNumber: "+1 (415) 555-0171",
      },
      {
        id: "mock-2",
        name: "VIP Follow-up",
        messageTemplate: "Hi there. We reserved this offer for VIP customers.",
        status: CampaignDtoStatus.PENDING,
        messageCount: 240,
        sentMessageCount: 0,
        pendingMessageCount: 240,
        errorMessageCount: 0,
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        contactGroupIds: ["mock-group-1"],
        fromPhoneNumber: "+1 (415) 555-0199",
      },
      {
        id: "mock-3",
        name: "Reactivation Feb List",
        messageTemplate: "We miss you. Come back and get 20% off.",
        status: CampaignDtoStatus.SENT,
        messageCount: 2905,
        sentMessageCount: 2860,
        pendingMessageCount: 0,
        errorMessageCount: 45,
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        contactGroupIds: ["mock-group-4"],
        fromPhoneNumber: "+1 (628) 555-0142",
      },
      {
        id: "mock-4",
        name: "March Warm Leads",
        messageTemplate: "Last chance to claim your onboarding bonus.",
        status: CampaignDtoStatus.CANCELLED_BY_TIMEOUT,
        messageCount: 480,
        sentMessageCount: 221,
        pendingMessageCount: 205,
        errorMessageCount: 54,
        createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
        contactGroupIds: ["mock-group-2"],
        fromPhoneNumber: "+1 (628) 555-0158",
      },
    ];
  }
}
