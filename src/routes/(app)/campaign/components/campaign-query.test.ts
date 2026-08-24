import { describe, expect, it } from "vitest";
import type { CampaignFilterInput, CampaignSortInput } from "$houdini/graphql/inputs";
import { buildCampaignRequest } from "./campaign-query";

const baseOptions = {
  cursor: null,
  filters: [] as CampaignFilterInput[],
  pageSize: 50,
  search: "",
  sort: [] as CampaignSortInput[],
};

describe("buildCampaignRequest", () => {
  it("loads scheduled runs for the schedule view", () => {
    expect(buildCampaignRequest({ ...baseOptions, listMode: "schedule" }).filter).toEqual({
      nested: [{ status: { in: ["SCHEDULED"] } }],
      operator: "AND",
    });
  });

  it("excludes scheduled runs from campaign history", () => {
    expect(buildCampaignRequest({ ...baseOptions, listMode: "history" }).filter).toEqual({
      nested: [{ status: { notIn: ["SCHEDULED"] } }],
      operator: "AND",
    });
  });
});
