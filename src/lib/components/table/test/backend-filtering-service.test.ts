import { describe, expect, expectTypeOf, it, vi } from "vitest";
import type { ContactGroupFilterInput, WalletTransactionFilterInput } from "$houdini/graphql/inputs";
import {
  accessorColumn,
  backendFilterDefinition,
  DatagridCore,
  type ColumnDef,
  type DataTableLoadRequest,
} from "../index";

interface Row {
  id: string;
  name: string;
}

const contactGroupFilter = backendFilterDefinition<ContactGroupFilterInput>();
const definitions = [
  contactGroupFilter.comparison({
    defaultOperator: "GREATER_OR_EQUAL",
    field: "contactCount",
    filterId: "minimum",
    label: "Minimum",
  }),
  contactGroupFilter.comparison({
    defaultOperator: "LESS_OR_EQUAL",
    field: "contactCount",
    filterId: "maximum",
    label: "Maximum",
  }),
] as const;

function columns(): ColumnDef<Row>[] {
  return [accessorColumn<Row, "name", unknown>({ accessorKey: "name" })];
}

async function flushMicrotasks(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe("backend FilteringService", () => {
  it("stores generated backend filters and reloads loaders with them directly", async () => {
    const loader = vi.fn((_request: DataTableLoadRequest<any, ContactGroupFilterInput>) => ({
      rows: [],
      nextCursor: null,
      totalRows: 0,
    }));
    const table = new DatagridCore<Row, any, ContactGroupFilterInput>({
      columns: columns(),
      initialState: {
        dataLoading: {
          loadOnStart: false,
          loader,
        },
        filtering: {
          filterDefinitions: definitions,
        },
      },
    });

    table.handlers.dataLoading.start();
    table.handlers.filtering.setFilterValue("minimum", 10, "GREATER_OR_EQUAL");
    table.handlers.filtering.setFilterValue("maximum", 20, "LESS_OR_EQUAL");
    await flushMicrotasks();

    expect(table.features.filtering.filters).toEqual([
      { contactCount: { greaterOrEqual: 10 } },
      { contactCount: { lessOrEqual: 20 } },
    ]);
    expect(table.handlers.filtering.getFilterId(table.features.filtering.filters[0]!)).toBe("minimum");
    expect(table.handlers.filtering.getFilterId(table.features.filtering.filters[1]!)).toBe("maximum");
    expect(loader).toHaveBeenLastCalledWith(
      expect.objectContaining({
        filters: [{ contactCount: { greaterOrEqual: 10 } }, { contactCount: { lessOrEqual: 20 } }],
      }),
    );
    expectTypeOf(table.handlers.filtering.filters).toEqualTypeOf<ContactGroupFilterInput[]>();
  });

  it("maps backend values back to control values", () => {
    const paymentFilter = backendFilterDefinition<WalletTransactionFilterInput>();
    const table = new DatagridCore<Row, any, WalletTransactionFilterInput>({
      columns: columns(),
      data: [],
      initialState: {
        filtering: {
          filterDefinitions: [
            paymentFilter.comparison({
              defaultOperator: "GREATER_OR_EQUAL",
              field: "amountUsdMicros",
              filterId: "minimumAmount",
              label: "Minimum amount",
              value: {
                fromBackend: (value) => value / 1_000_000,
                toBackend: (value) => Number(value) * 1_000_000,
              },
            }),
          ],
        },
      },
    });

    table.handlers.filtering.setFilterValue("minimumAmount", 1.25, "GREATER_OR_EQUAL");

    expect(table.handlers.filtering.filters).toEqual([{ amountUsdMicros: { greaterOrEqual: 1_250_000 } }]);
    expect(table.handlers.filtering.getFilterValue(table.handlers.filtering.filters[0]!)).toBe(1.25);
  });
});
