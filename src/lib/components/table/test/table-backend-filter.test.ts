import { describe, expect, expectTypeOf, it } from "vitest";
import {
  TableBackendFilter,
  textFilter,
  type DataTableComparisonOperator,
  type DataTableContainmentOperator,
  type DataTableTextOperator,
} from "../index";

interface ExampleFilterDto {
  amount?: null | { operator: DataTableComparisonOperator; value?: number };
  email?: null | { operator: DataTableTextOperator; value?: string | null };
  groupId?: null | { operator: DataTableContainmentOperator; value: string[] };
  nested?: ExampleFilterDto[];
  operator?: "AND" | "OR";
  search?: string | null;
}

const backendFilter = new TableBackendFilter<ExampleFilterDto>();
const exampleFilters = backendFilter.define([
  backendFilter.text({ filterId: "emailContains", fieldId: "email", defaultOperator: "CONTAINS" }),
  backendFilter.comparison({
    filterId: "minimumAmount",
    fieldId: "amount",
    defaultOperator: "GREATER_OR_EQUAL",
    backend: { mapValue: (value) => Number(value) },
  }),
  backendFilter.containment({ filterId: "groups", fieldId: "groupId", defaultOperator: "IN" }),
  backendFilter.text({ filterId: "search", fieldId: "search", backend: { mode: "value" } }),
] as const);

describe("table backend filter", () => {
  it("serializes standard and scalar filters", () => {
    expect(
      exampleFilters.toDtos([
        { filterId: "emailContains", type: "text", operator: "CONTAINS", value: "  ada@example.com  " },
        { filterId: "minimumAmount", type: "comparison", operator: "GREATER_OR_EQUAL", value: "12.50" },
        { filterId: "groups", type: "containment", operator: "IN", value: ["friends"] },
        { filterId: "search", type: "text", operator: "CONTAINS", value: "  Ada  " },
      ]),
    ).toEqual([
      { email: { operator: "CONTAINS", value: "ada@example.com" } },
      { amount: { operator: "GREATER_OR_EQUAL", value: 12.5 } },
      { groupId: { operator: "IN", value: ["friends"] } },
      { search: "Ada" },
    ]);
  });

  it("omits inactive filters and transforms that return undefined", () => {
    const mapper = backendFilter.define([
      backendFilter.text({
        filterId: "emailContains",
        fieldId: "email",
        backend: { mapValue: (value) => (value === "skip" ? undefined : value) },
      }),
    ] as const);

    expect(
      exampleFilters.toDtos([
        { filterId: "emailContains", type: "text", operator: "CONTAINS", value: " " },
        { filterId: "groups", type: "containment", operator: "IN", value: [] },
        { filterId: "minimumAmount", type: "comparison", operator: "EQUAL" },
      ]),
    ).toEqual([]);
    expect(mapper.toDto({ filterId: "emailContains", type: "text", operator: "CONTAINS", value: "skip" })).toBeNull();
  });

  it("rejects unknown filters, type mismatches, and duplicate definitions", () => {
    expect(() =>
      exampleFilters.toDto({ filterId: "unknown", type: "text", operator: "CONTAINS", value: "Ada" }),
    ).toThrow("Unknown filter definition unknown");
    expect(() =>
      exampleFilters.toDto({ filterId: "groups", type: "text", operator: "CONTAINS", value: "friends" }),
    ).toThrow("Filter groups must be a containment filter");
    expect(() =>
      backendFilter.define([
        backendFilter.text({ filterId: "duplicate", fieldId: "email" }),
        backendFilter.text({ filterId: "duplicate", fieldId: "email" }),
      ]),
    ).toThrow("Duplicate filter definition duplicate");
  });

  it("preserves the DTO and literal filter-id types", () => {
    expectTypeOf(exampleFilters.toDtos([])).toEqualTypeOf<ExampleFilterDto[]>();
    expectTypeOf(exampleFilters.definitions[0].filterId).toEqualTypeOf<"emailContains">();
  });

  it("rejects incompatible DTO definitions at compile time", () => {
    // @ts-expect-error comparison fields cannot be registered as text filters
    backendFilter.text({ filterId: "invalidKind", fieldId: "amount" });

    // @ts-expect-error nested composition fields are not filterable fields
    backendFilter.text({ filterId: "invalidField", fieldId: "nested" });

    backendFilter.comparison({
      filterId: "invalidTransform",
      fieldId: "amount",
      backend: {
        // @ts-expect-error amount transforms must produce numbers
        mapValue: () => "not-a-number",
      },
    });

    // @ts-expect-error registry definitions must be created by the DTO mapper
    backendFilter.define([textFilter({ filterId: "untyped", fieldId: "email" })]);
  });
});
