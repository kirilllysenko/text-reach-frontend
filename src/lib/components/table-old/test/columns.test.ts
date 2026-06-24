import { describe, expect, it } from "vitest";
import { accessorColumn, displayColumn, getCellValue, normalizeColumns } from "../core/columns";

interface ContactRow {
  id: string;
  profile: {
    firstName: string;
    lastName: string;
  };
  active: boolean;
}

describe("table columns", () => {
  it("creates accessor columns with readable defaults", () => {
    const column = accessorColumn<ContactRow>({
      accessorKey: "profile.firstName",
      filter: {
        kind: "text",
      },
    });

    expect(column).toMatchObject({
      accessorKey: "profile.firstName",
      filterable: true,
      header: "First Name",
      hideable: true,
      id: "profile.firstName",
      kind: "accessor",
      moveable: true,
      sortable: false,
    });
  });

  it("creates display columns that cannot sort or filter", () => {
    const column = displayColumn<ContactRow>({
      id: "row_actions",
    });

    expect(column).toMatchObject({
      filterable: false,
      header: "Row Actions",
      hideable: true,
      id: "row_actions",
      kind: "display",
      moveable: true,
      sortable: false,
    });
  });

  it("reads nested accessor values and returns undefined when a path cannot resolve", () => {
    const row: ContactRow = {
      active: true,
      id: "contact-1",
      profile: {
        firstName: "Ada",
        lastName: "Lovelace",
      },
    };

    expect(getCellValue(row, accessorColumn<ContactRow>({ accessorKey: "profile.firstName" }))).toBe("Ada");
    expect(
      getCellValue(
        { ...row, profile: null } as unknown as ContactRow,
        accessorColumn({ accessorKey: "profile.firstName" }),
      ),
    ).toBeUndefined();
    expect(getCellValue(row, displayColumn<ContactRow>({ id: "actions" }))).toBeUndefined();
  });

  it("normalizes sizing and feature defaults without replacing explicit feature values", () => {
    const columns = normalizeColumns<ContactRow, unknown>([
      accessorColumn<ContactRow>({
        accessorKey: "id",
        feature: {
          order: 4,
          visibility: false,
        },
        maxSize: 240,
        minSize: 80,
        size: 160,
      }),
      displayColumn<ContactRow>({
        id: "actions",
      }),
    ]);

    expect(columns[0]).toMatchObject({
      feature: {
        order: 4,
        visibility: false,
      },
      maxSize: 240,
      minSize: 80,
      size: 160,
    });
    expect(columns[1]).toMatchObject({
      feature: {
        order: 1,
        visibility: true,
      },
      maxSize: 480,
      minSize: 120,
      size: 180,
    });
  });
});
