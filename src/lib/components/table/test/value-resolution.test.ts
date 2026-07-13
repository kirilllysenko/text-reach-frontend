import { describe, expect, it, vi } from "vitest";
import {
  accessorColumn,
  comparisonFilter,
  containmentFilter,
  DatagridCore,
  sortDefinition,
  textFilter,
  type ColumnDef,
  type DataTableFilterFromDefinitions,
  type DataTableSortFromDefinitions,
} from "../index";
import type { LeafColumn } from "../core/column-types";
import type { DatagridCoreConfig } from "../core/config";

interface ContactRow {
  birthYear: number;
  id: string;
  firstName: string;
  groupIds: string[];
  lastName: string;
}

const contacts: ContactRow[] = [
  { birthYear: 1906, id: "2", firstName: "Grace", groupIds: ["navy"], lastName: "Hopper" },
  { birthYear: 1815, id: "1", firstName: "Ada", groupIds: ["math"], lastName: "Lovelace" },
  { birthYear: 1912, id: "3", firstName: "Alan", groupIds: ["math", "code"], lastName: "Turing" },
];

const contactFilterDefinitions = [
  textFilter({
    filterId: "fullName",
    fieldId: "fullName",
    defaultOperator: "CONTAINS",
    getValueFn: (contact: ContactRow) => `${contact.firstName} ${contact.lastName}`,
  }),
  comparisonFilter({
    filterId: "birthYear",
    fieldId: "birthYear",
    defaultOperator: "GREATER_OR_EQUAL",
    getValueFn: (contact: ContactRow) => contact.birthYear,
  }),
  containmentFilter({
    filterId: "groupIds",
    fieldId: "groupIds",
    defaultOperator: "IN",
    getValueFn: (contact: ContactRow) => contact.groupIds,
  }),
] as const;

type ContactFilter = DataTableFilterFromDefinitions<typeof contactFilterDefinitions>;

const contactSortDefinitions = [
  sortDefinition({
    sortId: "fullName",
    fieldId: "fullName",
    getValueFn: (contact: ContactRow) => `${contact.firstName} ${contact.lastName}`,
  }),
  sortDefinition({
    sortId: "birthYear",
    fieldId: "birthYear",
    defaultDirection: "descending",
    getValueFn: (contact: ContactRow) => contact.birthYear,
  }),
] as const;

type ContactSort = DataTableSortFromDefinitions<typeof contactSortDefinitions>;

const typedFilterExamples = [
  { filterId: "fullName", type: "text", operator: "CONTAINS", value: "ada" },
  { filterId: "birthYear", type: "comparison", operator: "GREATER_OR_EQUAL", value: 1900 },
  { filterId: "groupIds", type: "containment", operator: "IN", value: ["math"] },
] satisfies ContactFilter[];

const typedSortExamples = [
  { sortId: "fullName", direction: "ascending" },
  { sortId: "birthYear", direction: "descending" },
] satisfies ContactSort[];

void typedFilterExamples;
void typedSortExamples;

function createColumns(): ColumnDef<ContactRow>[] {
  return [
    accessorColumn<ContactRow, "firstName", unknown>({
      accessorKey: "firstName",
      header: "First name",
    }),
    accessorColumn<ContactRow, "lastName", unknown>({
      accessorKey: "lastName",
      header: "Last name",
    }),
  ] satisfies ColumnDef<ContactRow>[];
}

function createContactsTable(options: Partial<DatagridCoreConfig<ContactRow>> = {}) {
  return new DatagridCore<ContactRow>({
    columns: createColumns(),
    data: contacts,
    ...options,
  });
}

function visibleRowIds(table: DatagridCore<ContactRow>): string[] {
  return table.rows.getVisibleBasicRows().map((row) => row.original.id);
}

function getLeafColumn(table: DatagridCore<ContactRow>, columnId: string): LeafColumn<ContactRow> {
  return table.columns.findColumnByIdOrThrow(columnId) as LeafColumn<ContactRow>;
}

async function flushMicrotasks(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe("datagrid value resolution", () => {
  it("filters by a data field that has no rendered column", () => {
    const table = createContactsTable({
      initialState: {
        filtering: {
          filterDefinitions: contactFilterDefinitions,
          filters: [
            {
              filterId: "fullName",
              operator: "CONTAINS",
              type: "text",
              value: "ada",
            },
          ],
        },
      },
    });

    expect(visibleRowIds(table)).toEqual(["1"]);
  });

  it("sorts by a data field that has no rendered column", () => {
    const table = createContactsTable({
      initialState: {
        sorting: {
          sortDefinitions: contactSortDefinitions,
          sorts: [
            {
              sortId: "fullName",
              direction: "ascending",
            },
          ],
        },
      },
    });

    expect(visibleRowIds(table)).toEqual(["1", "3", "2"]);
  });

  it("defaults omitted sort definition directions to ascending", () => {
    const table = createContactsTable({
      initialState: {
        sorting: {
          sortDefinitions: contactSortDefinitions,
        },
      },
    });

    table.handlers.sorting.addSort("fullName");

    expect(contactSortDefinitions[0].defaultDirection).toBe("ascending");
    expect(table.features.sorting.sorts).toEqual([{ sortId: "fullName", direction: "ascending" }]);
  });

  it("uses configured sort definition defaults when adding a sort rule", () => {
    const table = createContactsTable({
      initialState: {
        sorting: {
          sortDefinitions: contactSortDefinitions,
        },
      },
    });

    table.handlers.sorting.addSort("birthYear");

    expect(table.features.sorting.sorts).toEqual([{ sortId: "birthYear", direction: "descending" }]);
  });

  it("skips local sorting when sorting is manual", () => {
    const table = createContactsTable({
      initialState: {
        sorting: {
          isManual: true,
          sortDefinitions: contactSortDefinitions,
          sorts: [
            {
              sortId: "fullName",
              direction: "ascending",
            },
          ],
        },
      },
    });

    expect(visibleRowIds(table)).toEqual(["2", "1", "3"]);
  });

  it("keeps existing column sorting and filtering APIs working", () => {
    const table = createContactsTable();

    table.handlers.sorting.toggleColumnSort(getLeafColumn(table, "lastName"), false);
    table.handlers.filtering.setColumnFilter(getLeafColumn(table, "firstName"), {
      filterId: "firstName",
      operator: "CONTAINS",
      type: "text",
      value: "a",
    });

    expect(visibleRowIds(table)).toEqual(["2", "1", "3"]);
  });

  it("lets filter definitions override column value getters", () => {
    const table = createContactsTable({
      initialState: {
        filtering: {
          filterDefinitions: [
            textFilter({
              filterId: "lastName",
              fieldId: "lastName",
              getValueFn: (contact: ContactRow) => contact.firstName,
            }),
          ],
        },
      },
    });

    table.handlers.filtering.setFilter("lastName", {
      filterId: "lastName",
      operator: "CONTAINS",
      type: "text",
      value: "ada",
    });

    expect(visibleRowIds(table)).toEqual(["1"]);
  });

  it("throws clear errors for unknown sort and filter targets", () => {
    const table = createContactsTable();

    expect(() => table.handlers.sorting.applyAscendingSortByField("missing")).toThrow("Sort missing not found");
    expect(() =>
      table.handlers.filtering.setFilter("missing", {
        filterId: "missing",
        operator: "CONTAINS",
        type: "text",
        value: "x",
      }),
    ).toThrow("Filter missing not found");
  });

  it("filters comparison values by data field", () => {
    const table = createContactsTable({
      initialState: { filtering: { filterDefinitions: contactFilterDefinitions } },
    });

    table.handlers.filtering.setFilter("birthYear", {
      filterId: "birthYear",
      operator: "LESS_THAN",
      type: "comparison",
      value: 1900,
    });

    expect(visibleRowIds(table)).toEqual(["1"]);
  });

  it("filters containment values by data field", () => {
    const table = createContactsTable({
      initialState: { filtering: { filterDefinitions: contactFilterDefinitions } },
    });

    table.handlers.filtering.setFilter("groupIds", {
      filterId: "groupIds",
      operator: "IN",
      type: "containment",
      value: ["math"],
    });

    expect(visibleRowIds(table)).toEqual(["1", "3"]);
  });
});

describe("datagrid pagination cursors", () => {
  it("tracks cursor boundaries alongside page navigation", () => {
    const table = createContactsTable({
      initialState: {
        pagination: {
          manual: true,
          pageSize: 2,
        },
      },
    });

    const firstPageRequest = table.features.pagination.getCurrentPageRequest();

    expect(firstPageRequest).toEqual({
      cursor: null,
      direction: "next",
      limit: 2,
      page: 1,
    });

    table.features.pagination.registerLoadResult(firstPageRequest, {
      nextCursor: ["page-2"],
      totalRows: 5,
    });

    expect(table.features.pagination.pageCursors).toEqual({
      1: null,
      2: ["page-2"],
    });
    expect(table.features.pagination.nextCursor).toEqual(["page-2"]);
    expect(table.features.pagination.previousCursor).toBeNull();
    expect(table.features.pagination.pageCount).toBe(3);

    const secondPageRequest = table.features.pagination.getNextPageRequest();
    table.handlers.pagination.goToNextPage();

    expect(secondPageRequest).toEqual({
      cursor: ["page-2"],
      direction: "next",
      limit: 2,
      page: 2,
    });
    expect(table.features.pagination.page).toBe(2);

    table.features.pagination.registerLoadResult(secondPageRequest!, {
      nextCursor: ["page-3"],
      totalRows: 5,
    });

    expect(table.features.pagination.pageCursors).toEqual({
      1: null,
      2: ["page-2"],
      3: ["page-3"],
    });
    expect(table.features.pagination.nextCursor).toEqual(["page-3"]);
    expect(table.features.pagination.previousCursor).toEqual(["page-2"]);

    const previousPageRequest = table.features.pagination.getPreviousPageRequest();
    table.handlers.pagination.goToPrevPage();

    expect(previousPageRequest).toEqual({
      cursor: ["page-2"],
      direction: "previous",
      limit: 2,
      page: 1,
    });
    expect(table.features.pagination.page).toBe(1);
  });

  it("uses offset when a page cursor is not known yet", () => {
    const table = createContactsTable({
      initialState: {
        pagination: {
          manual: true,
          pageSize: 2,
        },
      },
    });

    table.features.pagination.registerLoadResult(table.features.pagination.getCurrentPageRequest(), {
      nextCursor: ["page-2"],
      totalRows: 10,
    });

    expect(table.features.pagination.getPageRequest(4)).toEqual({
      cursor: null,
      direction: "next",
      limit: 2,
      offset: 6,
      page: 4,
    });
  });
});

describe("datagrid data loading", () => {
  it("loads rows through the configured loader and registers pagination cursors", async () => {
    const loader = vi.fn((request) => ({
      rows: [
        {
          birthYear: 1815,
          groupIds: ["math"],
          id: request.page === 2 ? "2" : "1",
          firstName: "Ada",
          lastName: "Lovelace",
        },
      ],
      nextCursor: request.page === 1 ? ["page-2"] : null,
      totalRows: 2,
    }));
    const table = createContactsTable({
      data: [],
      initialState: {
        dataLoading: {
          loader,
        },
        pagination: {
          manual: true,
          pageSize: 1,
        },
      },
    });

    table.handlers.dataLoading.start();
    await flushMicrotasks();

    expect(loader).toHaveBeenCalledWith(
      expect.objectContaining({
        cursor: null,
        direction: "next",
        filters: [],
        limit: 1,
        page: 1,
        sorts: [],
      }),
    );
    expect(visibleRowIds(table)).toEqual(["1"]);
    expect(table.features.pagination.pageCursors).toEqual({
      1: null,
      2: ["page-2"],
    });

    table.handlers.pagination.goToNextPage();
    await flushMicrotasks();

    expect(loader).toHaveBeenLastCalledWith(
      expect.objectContaining({
        cursor: ["page-2"],
        direction: "next",
        limit: 1,
        page: 2,
      }),
    );
    expect(visibleRowIds(table)).toEqual(["2"]);
  });

  it("includes active sorting in load requests", async () => {
    const loader = vi.fn(() => ({
      rows: [{ birthYear: 1815, groupIds: ["math"], id: "1", firstName: "Ada", lastName: "Lovelace" }],
      nextCursor: null,
      totalRows: 1,
    }));
    const table = createContactsTable({
      data: [],
      initialState: {
        dataLoading: {
          loader,
        },
        pagination: {
          manual: true,
          pageSize: 1,
        },
        sorting: {
          sortDefinitions: contactSortDefinitions,
          sorts: [{ sortId: "fullName", direction: "descending" }],
        },
      },
    });

    table.handlers.dataLoading.start();
    await flushMicrotasks();

    expect(loader).toHaveBeenCalledWith(
      expect.objectContaining({
        sorts: [{ sortId: "fullName", direction: "descending" }],
      }),
    );
  });

  it("reloads with active filters when filtering changes", async () => {
    const loader = vi.fn(() => ({
      rows: [{ birthYear: 1815, groupIds: ["math"], id: "1", firstName: "Ada", lastName: "Lovelace" }],
      nextCursor: null,
      totalRows: 1,
    }));
    const table = createContactsTable({
      data: [],
      initialState: {
        dataLoading: {
          loader,
        },
        pagination: {
          manual: true,
          pageSize: 1,
        },
        filtering: {
          filterDefinitions: contactFilterDefinitions,
        },
      },
    });

    table.handlers.dataLoading.start();
    await flushMicrotasks();
    loader.mockClear();

    table.handlers.filtering.setFilter("fullName", {
      filterId: "fullName",
      operator: "CONTAINS",
      type: "text",
      value: "ada",
    });
    await flushMicrotasks();

    expect(loader).toHaveBeenCalledWith(
      expect.objectContaining({
        cursor: null,
        filters: [{ filterId: "fullName", operator: "CONTAINS", type: "text", value: "ada" }],
        page: 1,
      }),
    );
  });

  it("reloads with active sorting when sorting changes", async () => {
    const loader = vi.fn(() => ({
      rows: [{ birthYear: 1815, groupIds: ["math"], id: "1", firstName: "Ada", lastName: "Lovelace" }],
      nextCursor: null,
      totalRows: 1,
    }));
    const table = createContactsTable({
      data: [],
      initialState: {
        dataLoading: {
          loader,
        },
        pagination: {
          manual: true,
          pageSize: 1,
        },
        sorting: {
          sortDefinitions: contactSortDefinitions,
        },
      },
    });

    table.handlers.dataLoading.start();
    await flushMicrotasks();
    loader.mockClear();

    table.handlers.sorting.applyDescendingSortByField("fullName");
    await flushMicrotasks();

    expect(loader).toHaveBeenCalledWith(
      expect.objectContaining({
        cursor: null,
        page: 1,
        sorts: [{ sortId: "fullName", direction: "descending" }],
      }),
    );
  });

  it("reloads with panel-style filter service methods", async () => {
    const loader = vi.fn(() => ({
      rows: [{ birthYear: 1815, groupIds: ["math"], id: "1", firstName: "Ada", lastName: "Lovelace" }],
      nextCursor: null,
      totalRows: 1,
    }));
    const table = createContactsTable({
      data: [],
      initialState: {
        dataLoading: {
          loader,
        },
        pagination: {
          manual: true,
          pageSize: 1,
        },
        filtering: {
          filterDefinitions: contactFilterDefinitions,
        },
      },
    });

    table.handlers.dataLoading.start();
    await flushMicrotasks();
    loader.mockClear();

    table.handlers.filtering.setFilter("fullName", {
      filterId: "fullName",
      operator: "CONTAINS",
      type: "text",
      value: "ada",
    });
    await flushMicrotasks();

    expect(table.features.filtering.filters).toEqual([
      { filterId: "fullName", operator: "CONTAINS", type: "text", value: "ada" },
    ]);
    expect(loader).toHaveBeenLastCalledWith(
      expect.objectContaining({
        filters: [{ filterId: "fullName", operator: "CONTAINS", type: "text", value: "ada" }],
      }),
    );

    table.handlers.filtering.clearFilters();
    await flushMicrotasks();

    expect(table.features.filtering.filters).toEqual([]);
    expect(loader).toHaveBeenLastCalledWith(
      expect.objectContaining({
        filters: [],
      }),
    );
  });

  it("keeps panel-style sorting service methods and header sorting state synchronized", async () => {
    const loader = vi.fn(() => ({
      rows: [{ birthYear: 1815, groupIds: ["math"], id: "1", firstName: "Ada", lastName: "Lovelace" }],
      nextCursor: null,
      totalRows: 1,
    }));
    const table = createContactsTable({
      data: [],
      initialState: {
        dataLoading: {
          loader,
        },
        pagination: {
          manual: true,
          pageSize: 1,
        },
        sorting: {
          sortDefinitions: contactSortDefinitions,
        },
      },
    });

    table.handlers.dataLoading.start();
    await flushMicrotasks();
    loader.mockClear();

    table.handlers.sorting.addSort("fullName", "ascending");
    await flushMicrotasks();

    expect(table.features.sorting.sorts).toEqual([{ sortId: "fullName", direction: "ascending" }]);
    expect(table.features.sorting.getSortDirection("fullName")).toBe("ascending");
    expect(loader).toHaveBeenLastCalledWith(
      expect.objectContaining({
        sorts: [{ sortId: "fullName", direction: "ascending" }],
      }),
    );

    table.handlers.sorting.updateSortDirection(0, "descending");
    await flushMicrotasks();

    expect(table.features.sorting.getSortDirection("fullName")).toBe("descending");
    expect(loader).toHaveBeenLastCalledWith(
      expect.objectContaining({
        sorts: [{ sortId: "fullName", direction: "descending" }],
      }),
    );

    table.handlers.sorting.updateSortId(0, "birthYear");
    await flushMicrotasks();

    expect(table.features.sorting.getSortDirection("fullName")).toBe("intermediate");
    expect(table.features.sorting.getSortDirection("birthYear")).toBe("descending");
    expect(loader).toHaveBeenLastCalledWith(
      expect.objectContaining({
        sorts: [{ sortId: "birthYear", direction: "descending" }],
      }),
    );

    table.handlers.sorting.removeSortAt(0);
    await flushMicrotasks();

    expect(table.features.sorting.sorts).toEqual([]);
    expect(loader).toHaveBeenLastCalledWith(
      expect.objectContaining({
        sorts: [],
      }),
    );
  });

  it("aborts the previous request when a new load starts", async () => {
    const signals: AbortSignal[] = [];
    const loader = vi.fn((request) => {
      signals.push(request.signal!);
      return Promise.resolve({
        rows: [{ birthYear: 1815, groupIds: ["math"], id: "1", firstName: "Ada", lastName: "Lovelace" }],
        nextCursor: null,
        totalRows: 1,
      });
    });
    const table = createContactsTable({
      data: [],
      initialState: {
        dataLoading: {
          loadOnStart: false,
          loader,
        },
        pagination: {
          manual: true,
          pageSize: 1,
        },
      },
    });

    table.handlers.dataLoading.start();

    const firstLoad = table.handlers.dataLoading.load();
    const secondLoad = table.handlers.dataLoading.load();
    await Promise.all([firstLoad, secondLoad]);

    expect(signals).toHaveLength(2);
    expect(signals[0]?.aborted).toBe(true);
    expect(signals[1]?.aborted).toBe(false);
  });

  it("stops reacting to table events after disposal", async () => {
    const loader = vi.fn(async () => ({ rows: contacts, nextCursor: null, totalRows: contacts.length }));
    const table = createContactsTable({
      data: [],
      initialState: {
        dataLoading: { loader },
      },
    });

    table.handlers.dataLoading.start();
    await flushMicrotasks();
    table.handlers.dataLoading.dispose();
    loader.mockClear();

    table.handlers.sorting.toggleColumnSort(getLeafColumn(table, "lastName"), false);
    await flushMicrotasks();

    expect(loader).not.toHaveBeenCalled();
  });
});
