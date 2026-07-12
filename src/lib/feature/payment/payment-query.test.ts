import { SortDirection } from "$lib/api/index.schemas";
import { describe, expect, it } from "vitest";
import { defaultWalletTransactionSorts } from "./payment-view-data";
import { buildWalletTransactionRequest } from "./payment-query";

describe("buildWalletTransactionRequest", () => {
  it("uses the typed table sorts for the wallet transaction DTO", () => {
    const request = buildWalletTransactionRequest({
      cursor: null,
      filters: [],
      idSearch: "",
      pageSize: 25,
      sorts: defaultWalletTransactionSorts,
    });

    expect(request.sort).toEqual({
      createdAt: { direction: SortDirection.DESC, order: 1 },
    });
  });

  it("uses the created-at default when the table has no sorts", () => {
    const request = buildWalletTransactionRequest({
      cursor: null,
      filters: [],
      idSearch: "",
      pageSize: 25,
      sorts: [],
    });

    expect(request.sort).toEqual({
      createdAt: { direction: SortDirection.DESC, order: 1 },
    });
  });
});
