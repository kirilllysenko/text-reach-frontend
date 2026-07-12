import { SortDirection, type ContactSortDto } from "$lib/api/index.schemas";
import type { DataTableSort } from "$lib/components/table";
import { describe, expect, it } from "vitest";
import { tableSortsToDto, type SortDtoField } from "./table-sort";

type ContactSortField = SortDtoField<ContactSortDto>;

const validContactSortField: ContactSortField = "email";
void validContactSortField;

// @ts-expect-error ContactSortDto only permits generated Sort fields.
const invalidContactSortField: ContactSortField = "id";
void invalidContactSortField;

describe("tableSortsToDto", () => {
  it("returns an empty DTO for no table sorts", () => {
    expect(tableSortsToDto([])).toEqual({});
  });

  it("converts one ascending sort", () => {
    const sorts = [{ direction: "ascending", sortId: "firstName" }] satisfies DataTableSort<"firstName">[];

    expect(tableSortsToDto(sorts)).toEqual({
      firstName: { direction: SortDirection.ASC, order: 1 },
    });
  });

  it("preserves one-based order and both directions for multiple sorts", () => {
    const sorts = [
      { direction: "descending", sortId: "lastName" },
      { direction: "ascending", sortId: "email" },
    ] satisfies DataTableSort<"lastName" | "email">[];

    expect(tableSortsToDto(sorts)).toEqual({
      lastName: { direction: SortDirection.DESC, order: 1 },
      email: { direction: SortDirection.ASC, order: 2 },
    });
  });
});
