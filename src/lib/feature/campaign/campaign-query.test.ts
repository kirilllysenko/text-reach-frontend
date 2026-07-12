import { SortDirection } from "$lib/api/index.schemas";
import { defaultCampaignSorts, type CampaignTableSort } from "$lib/feature/campaign/campaign-view-data";
import { describe, expect, it } from "vitest";
import { buildCampaignRequest } from "./campaign-query";

describe("buildCampaignRequest sorting", () => {
  it("preserves the campaign definition default", () => {
    const request = buildCampaignRequest({
      pageSize: 50,
      cursor: null,
      search: "",
      statusFilters: [],
      createdAfter: "",
      minSentMessageCount: "",
      minMessageCount: "",
      sorts: defaultCampaignSorts,
    });

    expect(request.sort).toEqual({
      createdAt: { direction: SortDirection.DESC, order: 1 },
    });
  });

  it("keeps table sort priority when serializing multiple fields", () => {
    const sorts = [
      { sortId: "name", direction: "ascending" },
      { sortId: "status", direction: "descending" },
    ] satisfies CampaignTableSort[];

    const request = buildCampaignRequest({
      pageSize: 50,
      cursor: null,
      search: "",
      statusFilters: [],
      createdAfter: "",
      minSentMessageCount: "",
      minMessageCount: "",
      sorts,
    });

    expect(request.sort).toEqual({
      name: { direction: SortDirection.ASC, order: 1 },
      status: { direction: SortDirection.DESC, order: 2 },
    });
  });
});
