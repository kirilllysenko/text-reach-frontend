import { describe, expect, it, vi } from "vitest";
import { accessorColumn, displayColumn } from "../core/columns";
import { createDataTable } from "../core/create-data-table";
import { createRenderedTable } from "../core/rendered-table";
import { EventService } from "../core/events";
import { columnFeature } from "../core/features/column.svelte";
import { columnOrderFeature } from "../core/features/column-order.svelte";
import { columnVisibilityFeature } from "../core/features/column-visibility.svelte";
import { filtersFeature } from "../core/features/filters.svelte";
import { infiniteLoaderFeature } from "../core/features/infinite-loader.svelte";
import { SortingFeature, sortingFeature } from "../core/features/sorting.svelte";
import { virtualWindowFeature } from "../core/features/virtual-window.svelte";

interface ContactRow {
  id: string;
  name: string;
}

function createColumnTable() {
  return createDataTable({
    features: [
      columnFeature<ContactRow>({
        columns: [
          accessorColumn<ContactRow>({
            accessorKey: "id",
          }),
          accessorColumn<ContactRow>({
            accessorKey: "name",
            moveable: false,
          }),
          displayColumn<ContactRow>({
            hideable: false,
            id: "actions",
          }),
        ],
      }),
      columnOrderFeature<ContactRow>(),
      columnVisibilityFeature(),
    ],
  });
}

describe("table features", () => {
  it("cycles sorting state and emits changes", () => {
    const events = new EventService();
    const onSortChange = vi.fn();
    const sorting = new SortingFeature(events);
    events.on("sortChange", onSortChange);

    sorting.toggle("name");
    sorting.toggle("createdAt", true);
    sorting.toggle("name", true);
    sorting.toggle("name", true);

    expect(sorting.sorts).toEqual([
      {
        direction: "ascending",
        sortId: "createdAt",
      },
    ]);
    expect(sorting.getDirection("name")).toBe("intermediate");
    expect(sorting.getIndex("createdAt")).toBe(1);
    expect(onSortChange).toHaveBeenCalledTimes(4);
  });

  it("sets and resets filters through the table API", () => {
    const onFilterChange = vi.fn();
    const table = createDataTable({
      features: [filtersFeature()],
    });
    table.events.on("filterChange", onFilterChange);

    table.filters.set("name", {
      filterId: "ignored",
      operator: "CONTAINS",
      type: "text",
      value: "ada",
    });
    table.filters.reset();

    expect(onFilterChange).toHaveBeenNthCalledWith(1, [
      {
        filterId: "name",
        operator: "CONTAINS",
        type: "text",
        value: "ada",
      },
    ]);
    expect(onFilterChange).toHaveBeenNthCalledWith(2, []);
    expect(table.filters.filters).toEqual([]);
  });

  it("orders columns, appends omitted columns, and respects moveable columns", () => {
    const table = createColumnTable();
    const onColumnOrderChange = vi.fn();
    table.events.on("columnOrderChange", onColumnOrderChange);

    table.columnOrder.setAll(["actions", "unknown"]);
    table.columnOrder.move("name", "left");

    expect(table.columnOrder.order).toEqual(["actions", "id", "name"]);
    expect(table.columnOrder.getVisibleColumns().map((column) => column.id)).toEqual(["actions", "id", "name"]);
    expect(onColumnOrderChange).toHaveBeenLastCalledWith({
      order: ["actions", "id", "name"],
    });
  });

  it("toggles hideable column visibility and ignores fixed columns", () => {
    const table = createColumnTable();
    const onColumnVisibilityChange = vi.fn();
    table.events.on("columnVisibilityChange", onColumnVisibilityChange);

    table.columnVisibility.toggle("id");
    table.columnVisibility.toggle("actions");

    expect(table.columnVisibility.isVisible("id")).toBe(false);
    expect(table.columnVisibility.isVisible("actions")).toBe(true);
    expect(table.columnOrder.getVisibleColumns().map((column) => column.id)).toEqual(["name", "actions"]);
    expect(onColumnVisibilityChange).toHaveBeenCalledOnce();
    expect(onColumnVisibilityChange).toHaveBeenCalledWith({
      columnId: "id",
      visible: false,
    });
  });

  it("loads initial and additional rows with current filters and sorting", async () => {
    const loadRows = vi
      .fn()
      .mockResolvedValueOnce({
        nextCursor: ["page-2"],
        rows: [{ id: "1", name: "Ada" }],
        totalRows: 2,
      })
      .mockResolvedValueOnce({
        nextCursor: null,
        rows: [{ id: "2", name: "Grace" }],
        totalRows: 2,
      });
    const table = createDataTable({
      features: [
        filtersFeature({
          filters: [
            {
              filterId: "name",
              operator: "CONTAINS",
              type: "text",
              value: "a",
            },
          ],
        }),
        sortingFeature({
          sorts: [
            {
              direction: "ascending",
              sortId: "name",
            },
          ],
        }),
        infiniteLoaderFeature<ContactRow>({
          loadRows,
          pageSize: 1,
        }),
      ],
    });

    await table.loadInitial();
    await table.loadMore();

    expect(loadRows).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        cursor: null,
        filters: table.filters.filters,
        limit: 1,
        sorting: table.sorting.sorts,
      }),
    );
    expect(loadRows).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        cursor: ["page-2"],
        filters: table.filters.filters,
        limit: 1,
        sorting: table.sorting.sorts,
      }),
    );
    expect(table.visibleRows).toEqual([
      { id: "1", name: "Ada" },
      { id: "2", name: "Grace" },
    ]);
    expect(table.statusLabel).toBe("2 of 2 loaded");
  });

  it("emits nearEnd when the virtual range reaches the threshold", () => {
    const table = createDataTable({
      features: [
        virtualWindowFeature({
          threshold: 2,
        }),
      ],
    });
    const onNearEnd = vi.fn();
    table.events.on("nearEnd", onNearEnd);
    table.setRows(
      [
        { id: "1", name: "Ada" },
        { id: "2", name: "Grace" },
        { id: "3", name: "Katherine" },
        { id: "4", name: "Hedy" },
      ],
      ["next"],
      4,
    );

    table.virtual.updateRange({
      end: 1,
      start: 0,
    });
    table.virtual.updateRange({
      end: 2,
      start: 0,
    });

    expect(onNearEnd).toHaveBeenCalledOnce();
    expect(table.virtual.height).toBe("100%");
  });

  it("renders capability fallbacks when optional features are missing", () => {
    const table = createDataTable({
      features: [
        columnFeature<ContactRow>({
          columns: [
            accessorColumn<ContactRow>({
              accessorKey: "id",
            }),
            accessorColumn<ContactRow>({
              accessorKey: "name",
              feature: {
                visibility: false,
              },
            }),
          ],
        }),
      ],
    });
    table.setRows([{ id: "1", name: "Ada" }], null, 1);

    const view = createRenderedTable(table);

    expect(view.capabilities).toMatchObject({
      canHideColumns: false,
      canLoadMore: false,
      canReorderColumns: false,
      canSort: false,
      isVirtual: false,
    });
    expect(view.visibleColumns.map((column) => column.id)).toEqual(["id"]);
    expect(view.getSortDirection("id")).toBe("intermediate");
    expect(view.rows).toEqual([{ id: "1", name: "Ada" }]);
  });
});
