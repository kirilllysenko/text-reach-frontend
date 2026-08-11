import { describe, expect, expectTypeOf, it, vi } from "vitest";
import type { ContactSortByInput } from "$houdini/graphql/inputs";
import {
  accessorColumn,
  backendSortDefinition,
  DatagridCore,
  type ColumnDef,
  type DataTableLoadRequest,
} from "../index";

interface Row {
  id: string;
  name: string;
}

const contactSort = backendSortDefinition<ContactSortByInput>();
const definitions = [
  contactSort({ field: "lastName", label: "Last name" }),
  contactSort({ field: "firstName", label: "First name", defaultDirection: "DESC" }),
] as const;

function columns(): ColumnDef<Row>[] {
  return [accessorColumn<Row, "name", unknown>({ accessorKey: "name" })];
}

async function flushMicrotasks(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe("backend SortingService", () => {
  it("stores generated backend sorts and reloads loaders with them directly", async () => {
    const loader = vi.fn((_request: DataTableLoadRequest<ContactSortByInput>) => ({
      rows: [],
      nextCursor: null,
      totalRows: 0,
    }));
    const table = new DatagridCore<Row, ContactSortByInput>({
      columns: columns(),
      initialState: {
        dataLoading: {
          loadOnStart: false,
          loader,
        },
        sorting: {
          sortDefinitions: definitions,
          sorts: [{ lastName: { direction: "ASC" } }],
        },
      },
    });

    table.handlers.dataLoading.start();
    table.handlers.sorting.updateSortDirection(0, "descending");
    await flushMicrotasks();

    expect(table.features.sorting.sorts).toEqual([{ lastName: { direction: "DESC" } }]);
    expect(loader).toHaveBeenLastCalledWith(
      expect.objectContaining({
        sorts: [{ lastName: { direction: "DESC" } }],
      }),
    );

    table.handlers.sorting.updateSortId(0, "firstName");
    await flushMicrotasks();

    expect(table.features.sorting.sorts).toEqual([{ firstName: { direction: "DESC" } }]);
    expectTypeOf(table.handlers.sorting.sorts).toEqualTypeOf<ContactSortByInput[]>();
  });
});
