import { describe, expect, it, vi } from "vitest";
import { accessorColumn, columnGroup, DatagridCore, sortDefinition, textFilter, type ColumnDef } from "../index";
import { SortingFeature } from "../core/features/sorting.svelte";

interface Row {
  id: string;
  name: string;
}

function columns(): ColumnDef<Row>[] {
  return [accessorColumn<Row, "name", unknown>({ accessorKey: "name" })];
}

describe("DatagridCore structure", () => {
  it("constructs each feature override once", () => {
    const constructorSpy = vi.fn();

    class TestSortingFeature extends SortingFeature {
      constructor(...args: ConstructorParameters<typeof SortingFeature>) {
        super(...args);
        constructorSpy();
      }
    }

    new DatagridCore<Row>({
      columns: columns(),
      data: [],
      features: { sorting: TestSortingFeature },
    });

    expect(constructorSpy).toHaveBeenCalledTimes(1);
  });

  it("requires local data when no loader is configured", () => {
    expect(() => new DatagridCore<Row>({ columns: columns() } as never)).toThrow(
      "Data is required when no data loader is configured",
    );
  });

  it("defaults loader-backed tables to empty data and 500 rows per page", () => {
    const table = new DatagridCore<Row>({
      columns: columns(),
      initialState: {
        dataLoading: {
          loadOnStart: false,
          loader: async () => ({ rows: [], nextCursor: null, totalRows: 0 }),
        },
      },
    });

    expect(table.originalState.data).toEqual([]);
    expect(table.features.pagination.pageSize).toBe(500);
  });

  it("preserves explicit loader-backed page sizes", () => {
    const table = new DatagridCore<Row>({
      columns: columns(),
      initialState: {
        dataLoading: {
          loadOnStart: false,
          loader: async () => ({ rows: [], nextCursor: null, totalRows: 0 }),
        },
        pagination: { pageSize: 25 },
      },
    });

    expect(table.features.pagination.pageSize).toBe(25);
  });

  it("does not share default size objects between columns", () => {
    const first = accessorColumn<Row, "id", unknown>({ accessorKey: "id" });
    const second = accessorColumn<Row, "name", unknown>({ accessorKey: "name" });
    const table = new DatagridCore<Row>({ columns: [first, second], data: [] });

    first.state.size.width = 999;

    expect(second.state.size.width).toBe(200);
    expect(table.columns.findColumnByIdOrThrow("name").state.size.width).toBe(200);
  });

  it("reports missing and cyclic column parents", () => {
    const table = new DatagridCore<Row>({ columns: columns(), data: [] });
    const orphan = accessorColumn<Row, "name", unknown>({ accessorKey: "name", columnId: "orphan" });
    orphan.parentColumnId = "missing";

    expect(() => table.processors.column.createColumnHierarchy([orphan])).toThrow(
      "Parent column missing not found for orphan",
    );

    const firstGroup = columnGroup<Row, unknown>({ columnId: "first", columns: [], header: "First" });
    const secondGroup = columnGroup<Row, unknown>({ columnId: "second", columns: [], header: "Second" });
    firstGroup.parentColumnId = secondGroup.columnId;
    secondGroup.parentColumnId = firstGroup.columnId;

    expect(() => table.processors.column.createColumnHierarchy([firstGroup, secondGroup])).toThrow(
      "Cyclic column hierarchy",
    );
  });
});

describe("local and manual value resolution", () => {
  it("uses definition value getters for headless local sorting and filtering", () => {
    const table = new DatagridCore<Row>({
      columns: columns(),
      data: [
        { id: "2", name: "Grace" },
        { id: "1", name: "Ada" },
      ],
      initialState: {
        filtering: {
          filterDefinitions: [
            textFilter({
              filterId: "normalizedName",
              getValueFn: (row: Row) => row.name.toLowerCase(),
            }),
          ],
          filters: [
            {
              filterId: "normalizedName",
              operator: "CONTAINS",
              type: "text",
              value: "a",
            },
          ],
        },
        sorting: {
          sortDefinitions: [
            sortDefinition({
              sortId: "normalizedName",
              getValueFn: (row: Row) => row.name.toLowerCase(),
            }),
          ],
          sorts: [{ sortId: "normalizedName", direction: "ascending" }],
        },
      },
    });

    expect(table.rows.getVisibleBasicRows().map((row) => row.original.name)).toEqual(["Ada", "Grace"]);
  });

  it("allows headless manual definitions without local getters", () => {
    expect(
      () =>
        new DatagridCore<Row>({
          columns: columns(),
          data: [],
          initialState: {
            filtering: {
              filterDefinitions: [textFilter({ filterId: "remoteSearch" })],
              filters: [
                {
                  filterId: "remoteSearch",
                  operator: "CONTAINS",
                  type: "text",
                  value: "ada",
                },
              ],
              isManual: true,
            },
            sorting: {
              isManual: true,
              sortDefinitions: [sortDefinition({ sortId: "remoteRank" })],
              sorts: [{ sortId: "remoteRank", direction: "ascending" }],
            },
          },
        }),
    ).not.toThrow();
  });

  it("constructs loader-backed tables with initial headless rules", () => {
    expect(
      () =>
        new DatagridCore<Row>({
          columns: columns(),
          initialState: {
            dataLoading: {
              loadOnStart: false,
              loader: async () => ({ rows: [], nextCursor: null, totalRows: 0 }),
            },
            filtering: {
              filterDefinitions: [textFilter({ filterId: "remoteSearch" })],
              filters: [
                {
                  filterId: "remoteSearch",
                  operator: "CONTAINS",
                  type: "text",
                  value: "ada",
                },
              ],
            },
            sorting: {
              sortDefinitions: [sortDefinition({ sortId: "remoteRank" })],
              sorts: [{ sortId: "remoteRank", direction: "ascending" }],
            },
          },
        }),
    ).not.toThrow();
  });

  it("reports definitions that cannot resolve local values", () => {
    expect(
      () =>
        new DatagridCore<Row>({
          columns: columns(),
          data: [{ id: "1", name: "Ada" }],
          initialState: {
            sorting: {
              sortDefinitions: [sortDefinition({ sortId: "missing" })],
              sorts: [{ sortId: "missing", direction: "ascending" }],
            },
          },
        }),
    ).toThrow("Sort missing has no local value getter");
  });
});
