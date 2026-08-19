import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { RegularContactImportField$options } from "$houdini/graphql/enums";
import type { ContactImportColumnInput, ContactImportInput } from "$houdini/graphql/inputs";
import type { DropdownOption } from "text-reach-frontend-library/components/dropdown";

export const CONTACT_IMPORT_IGNORE = "IGNORE";
const REGULAR_MAPPING_PREFIX = "REGULAR:";
const CUSTOM_MAPPING_PREFIX = "CUSTOM_FIELD:";

export type RegularContactImportField = RegularContactImportField$options;

export const regularContactImportFields = [
  "PHONE_NUMBER",
  "FIRST_NAME",
  "LAST_NAME",
  "EMAIL",
  "BIRTHDAY",
  "NOTES",
] as const satisfies readonly RegularContactImportField[];

export type ContactImportMappingValue =
  | typeof CONTACT_IMPORT_IGNORE
  | `${typeof REGULAR_MAPPING_PREFIX}${RegularContactImportField}`
  | `${typeof CUSTOM_MAPPING_PREFIX}${string}`;

export interface ContactImportPreviewColumn {
  index: number;
  label: string;
}

export interface ContactImportParseResult {
  columns: ContactImportPreviewColumn[];
  rows: string[][];
  skipFirstRow: boolean;
}

export interface ContactImportMapping {
  columnIndex: number;
  value: ContactImportMappingValue;
}

export interface ContactImportBuildOptions {
  contactGroupIds: string[];
  filename: string;
  mappings: ContactImportMapping[];
  skipFirstRow: boolean;
}

export const contactImportRegularFieldLabels = {
  PHONE_NUMBER: "Phone number",
  FIRST_NAME: "First name",
  LAST_NAME: "Last name",
  EMAIL: "Email",
  BIRTHDAY: "Birthday",
  NOTES: "Notes",
} satisfies Record<RegularContactImportField, string>;

export async function parseContactImportFile(file: File): Promise<ContactImportParseResult> {
  if (!isSupportedContactImportFile(file)) {
    throw new Error("Choose a CSV or XLSX file.");
  }

  const rows = file.name.toLowerCase().endsWith(".csv") ? await parseCsvFile(file) : await parseXlsxFile(file);
  const normalizedRows = normalizeRows(rows);

  if (normalizedRows.length === 0) {
    throw new Error("The selected file does not contain contact rows.");
  }

  const columnCount = Math.max(...normalizedRows.map((row) => row.length));

  if (columnCount === 0) {
    throw new Error("The selected file does not contain contact columns.");
  }

  const rowsWithColumns = normalizedRows.map((row) =>
    Array.from({ length: columnCount }, (_, index) => row[index] ?? ""),
  );
  const firstRow = rowsWithColumns[0] ?? [];

  return {
    columns: Array.from({ length: columnCount }, (_, index) => ({
      index,
      label: firstRow[index]?.trim() || `Column ${index + 1}`,
    })),
    rows: rowsWithColumns,
    skipFirstRow: shouldSkipFirstRow(rowsWithColumns),
  };
}

export function createContactImportMappingOptions(
  customFields: { id: string; name: string }[],
): DropdownOption<ContactImportMappingValue>[] {
  return [
    {
      id: CONTACT_IMPORT_IGNORE,
      value: "Ignore column",
    },
    ...regularContactImportFields.map((field) => ({
      id: createRegularContactImportMappingValue(field),
      value: contactImportRegularFieldLabels[field],
    })),
    ...customFields.map((field) => ({
      id: createCustomContactImportMappingValue(field.id),
      value: field.name,
    })),
  ];
}

export function createRegularContactImportMappingValue(field: RegularContactImportField): ContactImportMappingValue {
  return `${REGULAR_MAPPING_PREFIX}${field}`;
}

export function createCustomContactImportMappingValue(customFieldId: string): ContactImportMappingValue {
  return `${CUSTOM_MAPPING_PREFIX}${customFieldId}`;
}

export function inferContactImportMapping(
  column: ContactImportPreviewColumn,
  customFields: { id: string; name: string }[],
): ContactImportMappingValue {
  const normalizedLabel = normalizeHeader(column.label);
  const regularField = contactImportHeaderFieldMap[normalizedLabel];

  if (regularField) {
    return createRegularContactImportMappingValue(regularField);
  }

  const customField = customFields.find((field) => normalizeHeader(field.name) === normalizedLabel);
  return customField ? createCustomContactImportMappingValue(customField.id) : CONTACT_IMPORT_IGNORE;
}

export function buildContactImportRequest(options: ContactImportBuildOptions): ContactImportInput {
  const fields = buildContactImportFields(options.mappings);
  const error = validateContactImportFields(fields);

  if (error) {
    throw new Error(error);
  }

  return {
    filename: options.filename,
    fields,
    contactGroupIds: options.contactGroupIds,
    skipFirstRow: options.skipFirstRow,
  };
}

export function buildContactImportFields(mappings: ContactImportMapping[]): ContactImportColumnInput[] {
  return mappings.reduce<ContactImportColumnInput[]>((fields, mapping) => {
    const field = toContactImportField(mapping.value);

    if (!field) {
      return fields;
    }

    return [
      ...fields,
      {
        columnIndex: mapping.columnIndex,
        ...field,
      },
    ];
  }, []);
}

export function validateContactImportFields(fields: ContactImportColumnInput[]): string | null {
  const phoneFields = fields.filter((field) => field.regularField === "PHONE_NUMBER");

  if (phoneFields.length !== 1) {
    return "Map exactly one column to Phone number.";
  }

  const fieldKeys = fields.map(getContactImportFieldKey);

  if (new Set(fieldKeys).size !== fieldKeys.length) {
    return "Each contact field can only be mapped once.";
  }

  return null;
}

export function getContactImportPreviewRows(rows: string[][], skipFirstRow: boolean): string[][] {
  return rows.slice(skipFirstRow ? 1 : 0, skipFirstRow ? 11 : 10);
}

function isSupportedContactImportFile(file: File): boolean {
  const lowerName = file.name.toLowerCase();
  return lowerName.endsWith(".csv") || lowerName.endsWith(".xlsx");
}

async function parseCsvFile(file: File): Promise<unknown[][]> {
  const text = await file.text();

  if (!text.trim()) {
    return [];
  }

  const result = Papa.parse<unknown[]>(text, {
    skipEmptyLines: "greedy",
  });

  if (result.errors.length > 0) {
    throw new Error("Could not parse CSV file.");
  }

  return result.data;
}

async function parseXlsxFile(file: File): Promise<unknown[][]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error("The selected workbook does not contain a sheet.");
  }

  const sheet = workbook.Sheets[firstSheetName];

  if (!sheet) {
    throw new Error("The selected workbook does not contain a readable sheet.");
  }

  return XLSX.utils.sheet_to_json(sheet, {
    blankrows: false,
    defval: "",
    header: 1,
  }) as unknown[][];
}

function normalizeRows(rows: unknown[][]): string[][] {
  return rows.map((row) => row.map(normalizeCell)).filter((row) => row.some((cell) => cell.trim().length > 0));
}

function normalizeCell(value: unknown): string {
  if (value === null || typeof value === "undefined") {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value).trim();
}

function shouldSkipFirstRow(rows: string[][]): boolean {
  const firstRow = rows[0] ?? [];
  const secondRow = rows[1] ?? [];
  const knownHeaderMatches = firstRow.filter((cell) => contactImportHeaderFieldMap[normalizeHeader(cell)]).length;

  if (knownHeaderMatches > 0) {
    return true;
  }

  const textLikeCells = firstRow.filter((cell) => /[a-z]/i.test(cell)).length;
  const secondRowDataLikeCells = secondRow.filter((cell) => /@|\d{3,}/.test(cell)).length;
  const firstRowCellCount = firstRow.filter((cell) => cell.trim().length > 0).length;
  const likelyHeaderCellCount = Math.max(2, Math.ceil(firstRowCellCount * 0.75));

  return textLikeCells >= likelyHeaderCellCount && secondRowDataLikeCells > 0;
}

function toContactImportField(value: ContactImportMappingValue): Omit<ContactImportColumnInput, "columnIndex"> | null {
  if (value === CONTACT_IMPORT_IGNORE) {
    return null;
  }

  if (value.startsWith(REGULAR_MAPPING_PREFIX)) {
    return {
      regularField: value.slice(REGULAR_MAPPING_PREFIX.length) as RegularContactImportField,
    };
  }

  return {
    customFieldId: value.slice(CUSTOM_MAPPING_PREFIX.length),
  };
}

function getContactImportFieldKey(field: ContactImportColumnInput): string {
  return field.regularField
    ? `${REGULAR_MAPPING_PREFIX}${field.regularField}`
    : `${CUSTOM_MAPPING_PREFIX}${field.customFieldId}`;
}

function normalizeHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

const contactImportHeaderFieldMap: Record<string, RegularContactImportField | undefined> = {
  birthday: "BIRTHDAY",
  birthdate: "BIRTHDAY",
  dob: "BIRTHDAY",
  email: "EMAIL",
  emailaddress: "EMAIL",
  firstname: "FIRST_NAME",
  fname: "FIRST_NAME",
  givenname: "FIRST_NAME",
  lastname: "LAST_NAME",
  lname: "LAST_NAME",
  notes: "NOTES",
  phone: "PHONE_NUMBER",
  phonenumber: "PHONE_NUMBER",
  mobile: "PHONE_NUMBER",
  mobilenumber: "PHONE_NUMBER",
};
