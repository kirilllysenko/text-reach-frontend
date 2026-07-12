import { defaultMessageSorts, type MessageTableSort } from "$lib/feature/message/message-view-data";
import { describe, expect, it } from "vitest";
import { resolveMessageSorts } from "./message-state.svelte";

describe("resolveMessageSorts", () => {
  it("uses the definition default when the table has no active sorts", () => {
    const sorts = [] satisfies MessageTableSort[];

    expect(resolveMessageSorts(sorts)).toEqual(defaultMessageSorts);
  });
});
