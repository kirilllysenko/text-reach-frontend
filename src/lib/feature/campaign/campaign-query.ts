import {
  ComparisonOperator,
  ContainmentOperator,
  NestedOperator,
  PageDirection,
  type CampaignFilterDto,
  type PageRequestCampaignFilterDtoCampaignSortDto,
} from "$lib/api/index.schemas";
import type { CampaignStatus, CampaignTableSort } from "$lib/feature/campaign/campaign-view-data";
import { tableSortsToDto } from "$lib/utils/table-sort";

interface CampaignRequestOptions {
  pageSize: number;
  cursor: unknown[] | null;
  search: string;
  statusFilters: NonNullable<CampaignStatus>[];
  createdAfter: string;
  minSentMessageCount: string;
  minMessageCount: string;
  sorts: readonly CampaignTableSort[];
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
    sort: tableSortsToDto(options.sorts),
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
