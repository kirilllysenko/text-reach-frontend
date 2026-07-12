import { SortDirection } from "$lib/api/index.schemas";
import { defaultMessageSorts, type MessageTableSort } from "$lib/feature/message/message-view-data";
import { describe, expect, it } from "vitest";
import { buildMessageRequest } from "./message-query";

describe("buildMessageRequest sorting", () => {
  it("preserves the message definition default", () => {
    const request = buildMessageRequest({
      campaignId: "campaign-1",
      cursor: null,
      filters: [],
      pageSize: 500,
      search: "",
      sorts: defaultMessageSorts,
    });

    expect(request.sort).toEqual({
      sentAt: { direction: SortDirection.DESC, order: 1 },
    });
  });

  it("keeps table sort priority when serializing multiple fields", () => {
    const sorts = [
      { sortId: "status", direction: "ascending" },
      { sortId: "tenantPhoneNumber", direction: "descending" },
    ] satisfies MessageTableSort[];

    const request = buildMessageRequest({
      campaignId: "campaign-1",
      cursor: null,
      filters: [],
      pageSize: 500,
      search: "",
      sorts,
    });

    expect(request.sort).toEqual({
      status: { direction: SortDirection.ASC, order: 1 },
      tenantPhoneNumber: { direction: SortDirection.DESC, order: 2 },
    });
  });
});
