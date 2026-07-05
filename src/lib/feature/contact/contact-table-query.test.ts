import { describe, expect, it } from "vitest";
import { SortDirection } from "$lib/api/index.schemas";
import type { DataTableFilter, DataTableSort } from "$lib/components/table";
import { getContactSortRules, getContactTableFilters } from "./contact-table-query";

describe("contact table query helpers", () => {
  it("extracts contact filters from table filters", () => {
    const filters = [
      {
        filterId: "contactGroup",
        operator: "IN",
        type: "containment",
        value: ["group-a", "group-b"],
      },
      {
        filterId: "birthdayAfter",
        operator: "GREATER_OR_EQUAL",
        type: "comparison",
        value: "1990-01-01",
      },
      {
        filterId: "emailContains",
        operator: "CONTAINS",
        type: "text",
        value: "example.com",
      },
    ] satisfies DataTableFilter[];

    expect(getContactTableFilters(filters)).toEqual({
      birthdayAfter: "1990-01-01",
      contactGroupIds: ["group-a", "group-b"],
      emailContains: "example.com",
    });
  });

  it("ignores unsupported filter ids and operators", () => {
    const filters = [
      {
        filterId: "contactGroup",
        operator: "NOT_IN",
        type: "containment",
        value: ["group-a"],
      },
      {
        filterId: "emailContains",
        operator: "NOT_CONTAINS",
        type: "text",
        value: "example.com",
      },
    ] satisfies DataTableFilter[];

    expect(getContactTableFilters(filters)).toEqual({
      birthdayAfter: "",
      contactGroupIds: [],
      emailContains: "",
    });
  });

  it("normalizes supported table sorts and falls back to contact defaults", () => {
    const sorting = [
      {
        direction: "descending",
        sortId: "email",
      },
      {
        direction: "ascending",
        sortId: "unsupported",
      },
    ] satisfies DataTableSort[];

    expect(getContactSortRules(sorting)).toEqual([
      {
        direction: SortDirection.DESC,
        field: "email",
        id: "email",
      },
    ]);

    expect(getContactSortRules([])).toEqual([
      {
        direction: SortDirection.ASC,
        field: "lastName",
        id: "lastName",
      },
      {
        direction: SortDirection.ASC,
        field: "firstName",
        id: "firstName",
      },
    ]);
  });
});
