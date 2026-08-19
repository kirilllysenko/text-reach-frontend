import { describe, expect, it } from "vitest";
import { buildMessageFilter } from "./message-filter";

describe("message filter", () => {
  it("scopes messages to the campaign and combines the current filters and search", () => {
    expect(
      buildMessageFilter({
        campaignId: "campaign-1",
        filters: [{ status: { in: ["FAILED"] } }],
        search: "  follow up  ",
        tenantPhoneId: "phone-1",
      }),
    ).toEqual({
      operator: "AND",
      nested: [
        { campaignId: { in: ["campaign-1"] } },
        { status: { in: ["FAILED"] } },
        { tenantPhoneId: { in: ["phone-1"] } },
        {
          operator: "OR",
          nested: [{ text: { contains: "follow up" } }, { tenantPhoneNumber: { contains: "follow up" } }],
        },
      ],
    });
  });

  it("does not add a tenant phone constraint when all phones are selected", () => {
    expect(
      buildMessageFilter({
        campaignId: "campaign-1",
        filters: [],
        search: "",
        tenantPhoneId: null,
      }),
    ).toEqual({
      operator: "AND",
      nested: [{ campaignId: { in: ["campaign-1"] } }],
    });
  });
});
