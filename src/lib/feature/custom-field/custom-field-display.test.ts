import { describe, expect, it } from "vitest";
import type { CustomFieldTableSort, CustomFieldViewModel } from "./custom-field-view-data";
import { sortCustomFieldList } from "./custom-field-display";

const fields: CustomFieldViewModel[] = [
  { id: "field-1", name: "Alpha", type: "TEXT", typeLabel: "Text" },
  { id: "field-2", name: "Bravo", type: "DATE", typeLabel: "Date" },
];

describe("sortCustomFieldList", () => {
  it("uses table sort directions directly", () => {
    const sorting = [{ direction: "descending", sortId: "name" }] satisfies CustomFieldTableSort[];

    expect(sortCustomFieldList(fields, sorting).map((field) => field.id)).toEqual(["field-2", "field-1"]);
  });

  it("uses the name default when the table has no sorts", () => {
    expect(sortCustomFieldList([...fields].reverse(), []).map((field) => field.id)).toEqual(["field-1", "field-2"]);
  });
});
