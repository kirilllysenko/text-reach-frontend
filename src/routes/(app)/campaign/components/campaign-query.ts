import type { CampaignFilterInput, CampaignSortInput } from "$houdini/graphql/inputs";

interface CampaignRequestOptions {
  pageSize: number;
  cursor: string | null;
  filters: CampaignFilterInput[];
  search: string;
  sort: readonly CampaignSortInput[];
}

export function buildCampaignRequest(options: CampaignRequestOptions) {
  return {
    after: options.cursor ?? undefined,
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
          name: { contains: searchValue },
        },
        {
          messageTemplate: { contains: searchValue },
        },
      ],
    });
  }

  nested.push(...options.filters);

  if (nested.length === 0) {
    return undefined;
  }

  return {
    operator: "AND",
    nested,
  };
}
