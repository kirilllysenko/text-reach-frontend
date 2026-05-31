import {
  ComparisonOperator,
  ContainmentOperator,
  NestedOperator,
  PageDirection,
  type CampaignFilterDto,
  type CampaignSortDto,
  type PageRequestCampaignFilterDtoCampaignSortDto,
  type Sort,
} from "$lib/api/index.schemas";
import type { CampaignStatus, SortRule } from "$lib/features/campaigns/campaigns-view-data";

interface CampaignRequestOptions {
  pageSize: number;
  cursor: unknown[] | null;
  search: string;
  statusFilters: NonNullable<CampaignStatus>[];
  createdAfter: string;
  minSentMessageCount: string;
  minMessageCount: string;
  sortRules: SortRule[];
}

export function buildCampaignRequest(options: CampaignRequestOptions): PageRequestCampaignFilterDtoCampaignSortDto {
  return {
    pageSize: options.pageSize,
    position: options.cursor
      ? {
          type: "SEEK",
          cursor: options.cursor as Record<string, never>[],
          pageDirection: PageDirection.NEXT,
        }
      : undefined,
    filter: buildCampaignFilter(options),
    sort: buildCampaignSort(options.sortRules),
  };
}

function buildCampaignFilter(options: CampaignRequestOptions): CampaignFilterDto | undefined {
  const nested: CampaignFilterDto[] = [];
  const searchValue = options.search.trim();

  if (searchValue) {
    nested.push({
      operator: NestedOperator.OR,
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

  if (options.statusFilters.length > 0) {
    nested.push({
      status: {
        operator: ContainmentOperator.IN,
        value: options.statusFilters,
      },
    });
  }

  if (options.createdAfter) {
    const createdAfterDate = new Date(`${options.createdAfter}T00:00:00`);
    if (!Number.isNaN(createdAfterDate.valueOf())) {
      nested.push({
        createdAt: {
          operator: ComparisonOperator.GREATER_OR_EQUAL,
          value: createdAfterDate.toISOString(),
        },
      });
    }
  }

  const minSentMessageCount = Number(options.minSentMessageCount);
  if (options.minSentMessageCount && !Number.isNaN(minSentMessageCount)) {
    nested.push({
      sentMessageCount: {
        operator: ComparisonOperator.GREATER_OR_EQUAL,
        value: minSentMessageCount,
      },
    });
  }

  const minMessageCount = Number(options.minMessageCount);
  if (options.minMessageCount && !Number.isNaN(minMessageCount)) {
    nested.push({
      messageCount: {
        operator: ComparisonOperator.GREATER_OR_EQUAL,
        value: minMessageCount,
      },
    });
  }

  if (nested.length === 0) {
    return undefined;
  }

  return {
    operator: NestedOperator.AND,
    nested,
  };
}

function buildCampaignSort(sortRules: SortRule[]): CampaignSortDto {
  return sortRules.reduce<CampaignSortDto>((acc, rule, index) => {
    acc[rule.field] = {
      order: index + 1,
      direction: rule.direction,
    } satisfies Sort;
    return acc;
  }, {});
}
