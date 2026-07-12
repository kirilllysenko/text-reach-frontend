import { describe, expect, it } from "vitest";
import { SortDirection } from "$lib/api/index.schemas";
import { tableSortsToDto } from "$lib/utils/table-sort";
import { contactGroupSortDefinitions, defaultContactGroupSorts } from "./contact-group-sorting";

describe("contact group sorting defaults", () => {
  it("uses the definition tuple's name default", () => {
    expect(defaultContactGroupSorts).toEqual([
      {
        sortId: contactGroupSortDefinitions[0].sortId,
        direction: contactGroupSortDefinitions[0].defaultDirection,
      },
    ]);
  });

  it("converts the default to one-based DTO sort order", () => {
    expect(tableSortsToDto(defaultContactGroupSorts)).toEqual({
      name: { direction: SortDirection.ASC, order: 1 },
    });
  });
});
