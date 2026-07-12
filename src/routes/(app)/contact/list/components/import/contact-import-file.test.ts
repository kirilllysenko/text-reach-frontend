import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { parseContactImportFile } from "./contact-import-file";

describe("contact import file parsing", () => {
  it("parses CSV files with headers", async () => {
    const file = new File(["Phone,First Name\n5551234567,Ava"], "contacts.csv", { type: "text/csv" });
    const result = await parseContactImportFile(file);

    expect(result.skipFirstRow).toBe(true);
    expect(result.columns.map((column) => column.label)).toEqual(["Phone", "First Name"]);
    expect(result.rows).toEqual([
      ["Phone", "First Name"],
      ["5551234567", "Ava"],
    ]);
  });

  it("parses CSV files without headers", async () => {
    const file = new File(["5551234567,Ava\n5557654321,Bea"], "contacts.csv", { type: "text/csv" });
    const result = await parseContactImportFile(file);

    expect(result.skipFirstRow).toBe(false);
    expect(result.columns.map((column) => column.label)).toEqual(["5551234567", "Ava"]);
  });

  it("parses the first XLSX sheet", async () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([
      ["Phone", "Email"],
      ["5551234567", "ava@example.com"],
    ]);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Contacts");
    const file = new File([XLSX.write(workbook, { bookType: "xlsx", type: "array" })], "contacts.xlsx");
    const result = await parseContactImportFile(file);

    expect(result.skipFirstRow).toBe(true);
    expect(result.rows).toEqual([
      ["Phone", "Email"],
      ["5551234567", "ava@example.com"],
    ]);
  });

  it("rejects empty files", async () => {
    const file = new File([""], "contacts.csv", { type: "text/csv" });

    await expect(parseContactImportFile(file)).rejects.toThrow("The selected file does not contain contact rows.");
  });

  it("rejects unsupported file types", async () => {
    const file = new File(["[]"], "contacts.json", { type: "application/json" });

    await expect(parseContactImportFile(file)).rejects.toThrow("Choose a CSV or XLSX file.");
  });
});
