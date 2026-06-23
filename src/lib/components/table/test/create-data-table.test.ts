import { describe, expect, it } from "vitest";
import { createDataTable } from "../core/create-data-table";
import type { DataTableCore, DataTableFeature, DataTableFeatureId } from "../core/data-table.svelte";

interface TestFeatureApi {
  readonly value: string;
}

function testFeature(
  id: DataTableFeatureId,
  dependencies: readonly DataTableFeatureId[] = [],
  value: string = id,
): DataTableFeature<TestFeatureApi> {
  return {
    dependencies,
    id,
    install() {
      return {
        get value() {
          return value;
        },
      };
    },
  };
}

describe("createDataTable", () => {
  it("installs feature APIs on the table", () => {
    const table = createDataTable<{ id: string }>({
      features: [testFeature("sorting", [], "installed")],
    }) as unknown as DataTableCore<{ id: string }> & TestFeatureApi;

    expect(table.value).toBe("installed");
    expect(table.visibleRows).toEqual([]);
  });

  it("rejects duplicate feature ids", () => {
    expect(() =>
      createDataTable({
        features: [testFeature("sorting"), testFeature("sorting")],
      }),
    ).toThrow('Duplicate DataTable feature "sorting".');
  });

  it("rejects missing dependencies", () => {
    expect(() =>
      createDataTable({
        features: [testFeature("sorting", ["filters"])],
      }),
    ).toThrow('DataTable feature "sorting" requires missing feature "filters".');
  });

  it("requires dependencies to be installed first", () => {
    expect(() =>
      createDataTable({
        features: [testFeature("sorting", ["filters"]), testFeature("filters")],
      }),
    ).toThrow('DataTable feature "sorting" requires "filters" to be installed first.');
  });
});
