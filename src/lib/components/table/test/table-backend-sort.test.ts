import { describe, expect, expectTypeOf, it } from "vitest";
import { sortDefinition, TableBackendSort } from "../index";

interface ExampleBackendSort {
  createdAt?: { direction: "ASC" | "DESC"; order: number };
  email?: { direction: "ASC" | "DESC"; order: number };
  filter?: string;
  invalidDirection?: { direction: boolean; order: number };
}

const backendSort = new TableBackendSort<ExampleBackendSort>();
const exampleSorts = backendSort.define([
  backendSort.sort({ sortId: "email", fieldId: "email", label: "Email" }),
  backendSort.sort({
    sortId: "newest",
    fieldId: "createdAt",
    label: "Created",
    defaultDirection: "descending",
  }),
] as const);

describe("table backend sort", () => {
  it("maps ordered table sorts to backend fields", () => {
    expect(
      exampleSorts.toBackend([
        { sortId: "newest", direction: "descending" },
        { sortId: "email", direction: "ascending" },
      ]),
    ).toEqual({
      createdAt: { direction: "DESC", order: 1 },
      email: { direction: "ASC", order: 2 },
    });
  });

  it("returns an empty backend sort for no active sorts", () => {
    expect(exampleSorts.toBackend([])).toEqual({});
  });

  it("rejects unknown sorts and duplicate definitions", () => {
    expect(() => exampleSorts.toBackend([{ sortId: "unknown", direction: "ascending" }])).toThrow(
      "Unknown sort definition unknown",
    );
    expect(() =>
      backendSort.define([
        backendSort.sort({ sortId: "duplicate", fieldId: "email" }),
        backendSort.sort({ sortId: "duplicate", fieldId: "createdAt" }),
      ]),
    ).toThrow("Duplicate sort definition duplicate");
  });

  it("preserves backend and literal sort-id types", () => {
    expectTypeOf(exampleSorts.toBackend([])).toEqualTypeOf<ExampleBackendSort>();
    expectTypeOf(exampleSorts.definitions[0].sortId).toEqualTypeOf<"email">();
  });

  it("rejects incompatible definitions at compile time", () => {
    // @ts-expect-error non-sort backend properties cannot be used as fields
    backendSort.sort({ sortId: "invalidField", fieldId: "filter" });

    // @ts-expect-error unknown backend properties cannot be used as fields
    backendSort.sort({ sortId: "unknownField", fieldId: "missing" });

    // @ts-expect-error backend sort directions must accept ASC and DESC
    backendSort.sort({ sortId: "invalidDirection", fieldId: "invalidDirection" });

    // @ts-expect-error registry definitions must be created by the backend sort
    backendSort.define([sortDefinition({ sortId: "untyped", fieldId: "email" })]);
  });
});
