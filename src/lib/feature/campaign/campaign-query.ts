import type { CampaignFilterInput, CampaignSortInput } from "$houdini/graphql/inputs";

interface CampaignRequestOptions {
  pageSize: number;
  cursor: unknown[] | null;
  filters: CampaignFilterInput[];
  search: string;
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
