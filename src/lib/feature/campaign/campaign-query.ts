import type { CampaignFilterInput, CampaignSortInput } from "$houdini/graphql/inputs";
import type { CampaignStatus } from "$lib/feature/campaign/campaign-view-data";

interface CampaignRequestOptions {
  pageSize: number;
  cursor: unknown[] | null;
  search: string;
  statusFilters: NonNullable<CampaignStatus>[];
  createdAfter: string;
  minSentMessageCount: string;
  minMessageCount: string;
  sort: readonly CampaignSortInput[];
}

export function buildCampaignRequest(options: CampaignRequestOptions) {
  const cursor = typeof options.cursor?.[0] === "string" ? options.cursor[0] : undefined;
  return {
    after: cursor,
    first: options.pageSize,
    filter: buildCampaignFilter(options),
    sortBy: [...options.sort],
  };
}

function buildCampaignFilter(options: CampaignRequestOptions): CampaignFilterInput | undefined {
  const nested: CampaignFilterInput[] = [];
  const searchValue = options.search.trim();

  if (searchValue) {
    nested.push({
      operator: "OR",
      nested: [
        {
          nested: [],
          operator: "AND",
          name: {
            operator: "CONTAINS",
            value: searchValue,
          },
        },
        {
          nested: [],
          operator: "AND",
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
      nested: [],
      operator: "AND",
      status: {
        operator: "IN",
        value: options.statusFilters,
      },
    });
  }

  if (options.createdAfter) {
    const createdAfterDate = new Date(`${options.createdAfter}T00:00:00`);
    if (!Number.isNaN(createdAfterDate.valueOf())) {
      nested.push({
        nested: [],
        operator: "AND",
        createdAt: {
          operator: "GREATER_OR_EQUAL",
          value: createdAfterDate.toISOString(),
        },
      });
    }
  }

  const minSentMessageCount = Number(options.minSentMessageCount);
  if (options.minSentMessageCount && !Number.isNaN(minSentMessageCount)) {
    nested.push({
      nested: [],
      operator: "AND",
      sentMessageCount: {
        operator: "GREATER_OR_EQUAL",
        value: minSentMessageCount,
      },
    });
  }

  const minMessageCount = Number(options.minMessageCount);
  if (options.minMessageCount && !Number.isNaN(minMessageCount)) {
    nested.push({
      nested: [],
      operator: "AND",
      messageCount: {
        operator: "GREATER_OR_EQUAL",
        value: minMessageCount,
      },
    });
  }

  if (nested.length === 0) {
    return undefined;
  }

  return {
    operator: "AND",
    nested,
  };
}
