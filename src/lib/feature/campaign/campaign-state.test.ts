import { SortDirection } from "$lib/api/index.schemas";
import { describe, expect, it } from "vitest";
import { buildContactGroupListRequest } from "./campaign-state.svelte";

describe("buildContactGroupListRequest", () => {
  it("serializes the contact-group default with one-based ordering", () => {
    expect(buildContactGroupListRequest()).toEqual({
      pageSize: 300,
      sort: {
        name: { direction: SortDirection.ASC, order: 1 },
      },
    });
  });
});
