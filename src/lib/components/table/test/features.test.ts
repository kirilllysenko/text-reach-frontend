import { describe, expect, it } from "vitest";
import { accessorColumn, DatagridCore, type ColumnDef } from "../index";
import { LifecycleHooks } from "../core/managers/lifecycle-hooks-manager.svelte";
import type { AccessorColumn } from "../core/column-types";

interface Row {
  id: string;
  name: string;
  score: number;
}

const rows: Row[] = [
  { id: "1", name: "Ada", score: 10 },
  { id: "2", name: "Grace", score: 20 },
  { id: "3", name: "Alan", score: 15 },
];

function createColumns(): ColumnDef<Row>[] {
  return [
    accessorColumn<Row, "name", unknown>({ accessorKey: "name" }),
    accessorColumn<Row, "score", unknown>({
      accessorKey: "score",
      options: { calculateFacets: true },
    }),
  ];
}

function createTestDatagrid() {
  return new DatagridCore<Row>({ columns: createColumns(), data: rows });
}

describe("preserved table features", () => {
  it("keeps global search and faceting operational", () => {
    const table = new DatagridCore<Row>({
      columns: createColumns(),
      data: rows,
      initialState: { globalSearch: { isFuzzySearchEnabled: false } },
    });

    expect(table.features.columnFaceting.getNumericFacet("score")).toEqual({ min: 10, max: 20 });

    table.handlers.globalSearch.updateSearchQuery("Grace");

    expect(table.rows.getVisibleBasicRows().map((row) => row.original.id)).toEqual(["2"]);
  });

  it("keeps row selection, pinning, and expansion operational", () => {
    const table = createTestDatagrid();

    table.handlers.rows.toggleRowSelection("2");
    table.handlers.rows.pinRowToTop("2");
    table.handlers.rows.toggleRowExpansion("2");

    expect(table.features.rowSelection.getSelectedRowsIds()).toEqual(["2"]);
    expect(table.features.rowPinning.getTopRows().map((row) => row.identifier)).toEqual(["2"]);
    expect(table.features.rowExpanding.isRowExpanded("2")).toBe(true);

    table.handlers.rows.unpinRow("2");
    table.handlers.rows.deselectAllRows();

    expect(table.features.rowPinning.getTopRows()).toEqual([]);
    expect(table.features.rowSelection.getSelectedRowsIds()).toEqual([]);
  });

  it("keeps column sizing, visibility, pinning, ordering, and grouping operational", () => {
    const table = createTestDatagrid();

    table.handlers.column.updateColumnSize("name", 320);
    table.handlers.column.toggleColumnVisibility("score");
    table.handlers.column.pinColumn("name", "left");

    expect(table.columns.findColumnByIdOrThrow("name").state.size.width).toBe(320);
    expect(table.columns.findColumnByIdOrThrow("score").state.visible).toBe(false);
    expect(table.columns.findColumnByIdOrThrow("name").state.pinning.position).toBe("left");

    table.handlers.column.changeColumnPinningPosition("name", "none");
    table.handlers.column.moveRight("name");
    expect(table.columns.getLeafColumns().map((column) => column.columnId)).toEqual(["score", "name"]);

    table.handlers.grouping.updateGrouping(["name"]);
    expect(table.features.grouping.activeGroups).toEqual(["name"]);
    expect(table.cacheManager.hierarchicalRows?.length).toBeGreaterThan(0);
  });

  it("keeps dynamic column grouping operational", () => {
    const table = createTestDatagrid();

    table.handlers.column.createGroup({
      newGroupName: "Details",
      selectedColumns: { name: true, score: true },
    });

    const groups = table.columns.getGroupColumns();
    expect(groups).toHaveLength(1);
    expect(groups[0]?.header).toBe("Details");
    expect(groups[0]?.columns.map((column) => column.columnId)).toEqual(["name", "score"]);

    table.handlers.column.deleteGroupColumn(groups[0]!);
    expect(table.columns.getGroupColumns()).toEqual([]);
  });

  it("keeps editing and lifecycle hooks operational", () => {
    const lifecycleHooks = new LifecycleHooks<Row>();
    lifecycleHooks.register(LifecycleHooks.HOOKS.PRE_PROCESS_DATA, (data: Row[]) =>
      data.map((row) => ({ ...row, name: row.name.toUpperCase() })),
    );

    const table = new DatagridCore<Row>({ columns: createColumns(), data: rows, lifecycleHooks });
    const row = table.rows.getVisibleBasicRows().find((current) => current.identifier === "1");
    const nameColumn = table.columns.findColumnByIdOrThrow("name") as AccessorColumn<Row>;

    expect(row).toBeDefined();
    table.handlers.editing.updateCellValue(row!, nameColumn, "LOVELACE");

    expect(table.originalState.data.find((current) => current.id === "1")?.name).toBe("LOVELACE");
  });
});
