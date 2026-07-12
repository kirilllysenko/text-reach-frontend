import { describe, expect, it } from "vitest";
import { RegularContactImportFieldDto } from "$lib/api/index.schemas";
import {
  CONTACT_IMPORT_IGNORE,
  createCustomContactImportMappingValue,
  createRegularContactImportMappingValue,
  buildContactImportFields,
  buildContactImportRequest,
  inferContactImportMapping,
  validateContactImportFields,
} from "./contact-import-mapping.svelte";

describe("contact import mapping", () => {
  it("encodes regular and custom field mappings", () => {
    expect(createRegularContactImportMappingValue(RegularContactImportFieldDto.PhoneNumber)).toBe(
      `REGULAR:${RegularContactImportFieldDto.PhoneNumber}`,
    );
    expect(createCustomContactImportMappingValue("custom-a")).toBe("CUSTOM_FIELD:custom-a");
  });

  it("infers regular header aliases and normalized custom fields", () => {
    expect(
      inferContactImportMapping({ index: 0, label: "Mobile Number" }, [{ id: "custom-a", name: "Favorite color" }]),
    ).toBe(createRegularContactImportMappingValue(RegularContactImportFieldDto.PhoneNumber));
    expect(
      inferContactImportMapping({ index: 1, label: "favorite-color" }, [{ id: "custom-a", name: "Favorite color" }]),
    ).toBe(createCustomContactImportMappingValue("custom-a"));
  });

  it("builds import requests from mapped columns", () => {
    expect(
      buildContactImportRequest({
        filename: "uploaded.csv",
        contactGroupIds: ["group-a"],
        skipFirstRow: true,
        mappings: [
          { columnIndex: 0, value: createRegularContactImportMappingValue(RegularContactImportFieldDto.PhoneNumber) },
          { columnIndex: 1, value: createRegularContactImportMappingValue(RegularContactImportFieldDto.FirstName) },
          { columnIndex: 2, value: CONTACT_IMPORT_IGNORE },
          { columnIndex: 3, value: createCustomContactImportMappingValue("custom-a") },
        ],
      }),
    ).toEqual({
      filename: "uploaded.csv",
      contactGroupIds: ["group-a"],
      skipFirstRow: true,
      fields: [
        { columnIndex: 0, field: { type: "REGULAR", field: RegularContactImportFieldDto.PhoneNumber } },
        { columnIndex: 1, field: { type: "REGULAR", field: RegularContactImportFieldDto.FirstName } },
        { columnIndex: 3, field: { type: "CUSTOM_FIELD", custom_field_id: "custom-a" } },
      ],
    });
  });

  it("rejects imports without exactly one phone number column", () => {
    expect(() =>
      buildContactImportRequest({
        filename: "uploaded.csv",
        contactGroupIds: [],
        skipFirstRow: false,
        mappings: [
          { columnIndex: 0, value: createRegularContactImportMappingValue(RegularContactImportFieldDto.FirstName) },
        ],
      }),
    ).toThrow("Map exactly one column to Phone number.");
  });

  it("rejects duplicate field mappings", () => {
    const fields = buildContactImportFields([
      { columnIndex: 0, value: createRegularContactImportMappingValue(RegularContactImportFieldDto.PhoneNumber) },
      { columnIndex: 1, value: createRegularContactImportMappingValue(RegularContactImportFieldDto.Email) },
      { columnIndex: 2, value: createRegularContactImportMappingValue(RegularContactImportFieldDto.Email) },
    ]);

    expect(validateContactImportFields(fields)).toBe("Each contact field can only be mapped once.");
  });
});
