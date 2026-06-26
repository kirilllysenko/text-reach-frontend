import { describe, expect, it, vi } from "vitest";
import { accessorColumn, DatagridCore, type ColumnDef, type DataField } from "../index";
import type { DatagridCoreConfig, LeafColumn } from "../core/types";

vi.mock("fuse.js", () => ({
  default: class FuseMock {
    search() {
      return [];
    }
  },
}));

interface ContactRow {
  id: string;
  firstName: string;
  lastName: string;
}

const contacts: ContactRow[] = [
  { id: "2", firstName: "Grace", lastName: "Hopper" },
  { id: "1", firstName: "Ada", lastName: "Lovelace" },
  { id: "3", firstName: "Alan", lastName: "Turing" },
];

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

const fullNameField = {
  fieldId: "fullName",
  label: "Full name",
  getValueFn: (contact: ContactRow) => `${contact.firstName} ${contact.lastName}`,
  sortable: true,
  filterable: true,
} satisfies DataField<ContactRow>;

function createContactsTable(options: Partial<DatagridCoreConfig<ContactRow>> = {}) {
  return new DatagridCore<ContactRow>({
    columns: createColumns(),
    data: contacts,
    dataFields: [fullNameField],
    ...options,
  });
}

function visibleRowIds(table: DatagridCore<ContactRow>): string[] {
  return table.rows.getVisibleBasicRows().map((row) => row.original.id);
}

function getLeafColumn(table: DatagridCore<ContactRow>, columnId: string): LeafColumn<ContactRow> {
  return table.columns.findColumnByIdOrThrow(columnId) as LeafColumn<ContactRow>;
}

describe("datagrid data fields", () => {
  it("filters by a data field that has no rendered column", () => {
    const table = createContactsTable({
      initialState: {
        filtering: {
          conditions: [
            {
              fieldId: "fullName",
              operator: "contains",
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
          sortConfigs: [
            {
              fieldId: "fullName",
              direction: "ascending",
            },
          ],
        },
      },
    });

    expect(visibleRowIds(table)).toEqual(["1", "3", "2"]);
  });

  it("keeps existing column sorting and filtering APIs working", () => {
    const table = createContactsTable();

    table.handlers.sorting.toggleColumnSort(getLeafColumn(table, "lastName"), false);
    table.handlers.filtering.updateFilterCondition({
      column: getLeafColumn(table, "firstName"),
      operator: "contains",
      value: "a",
    });

    expect(visibleRowIds(table)).toEqual(["2", "1", "3"]);
  });

  it("lets explicit data fields override auto-created column fields", () => {
    const table = createContactsTable({
      dataFields: [
        fullNameField,
        {
          fieldId: "lastName",
          getValueFn: (contact) => contact.firstName,
          filterable: true,
          sortable: true,
        },
      ],
    });

    table.handlers.filtering.updateFieldFilterCondition({
      fieldId: "lastName",
      operator: "contains",
      value: "ada",
    });

    expect(visibleRowIds(table)).toEqual(["1"]);
  });

  it("throws a clear error for unknown data fields", () => {
    const table = createContactsTable();

    expect(() => table.handlers.sorting.applyAscendingSortByField("missing")).toThrow("Data field missing not found");
    expect(() =>
      table.handlers.filtering.updateFieldFilterCondition({
        fieldId: "missing",
        operator: "contains",
        value: "x",
      }),
    ).toThrow("Data field missing not found");
  });
});
