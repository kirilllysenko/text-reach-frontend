import { describe, expect, it } from "vitest";
import { SortDirection } from "$lib/api/index.schemas";
import { tableSortsToDto } from "$lib/utils/table-sort";
import { contactSortDefinitions, defaultContactSorts } from "./contact-sorting";

describe("contact sorting defaults", () => {
  it("uses definition tuple members and directions for the initial sort stack", () => {
    expect(defaultContactSorts).toEqual([
      {
        sortId: contactSortDefinitions[0].sortId,
        direction: contactSortDefinitions[0].defaultDirection,
      },
      {
        sortId: contactSortDefinitions[1].sortId,
        direction: contactSortDefinitions[1].defaultDirection,
      },
    ]);
  });

  it("converts defaults to one-based DTO sort order", () => {
    expect(tableSortsToDto(defaultContactSorts)).toEqual({
      firstName: { direction: SortDirection.ASC, order: 2 },
      lastName: { direction: SortDirection.ASC, order: 1 },
    });
  });
});
