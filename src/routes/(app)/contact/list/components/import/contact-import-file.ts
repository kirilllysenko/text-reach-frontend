import Papa from "papaparse";
import * as XLSX from "xlsx";
import { isContactImportHeader } from "./contact-import-mapping.svelte";

export interface ContactImportPreviewColumn {
  index: number;
  label: string;
}

export interface ContactImportParseResult {
  columns: ContactImportPreviewColumn[];
  rows: string[][];
  skipFirstRow: boolean;
}

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

function isSupportedContactImportFile(file: File): boolean {
  const lowerName = file.name.toLowerCase();
  return lowerName.endsWith(".csv") || lowerName.endsWith(".xlsx");
}

async function parseCsvFile(file: File): Promise<unknown[][]> {
  const text = await file.text();

  if (!text.trim()) {
    return [];
  }

  const result = Papa.parse<unknown[]>(text, { skipEmptyLines: "greedy" });

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

  return XLSX.utils.sheet_to_json(sheet, { blankrows: false, defval: "", header: 1 }) as unknown[][];
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
  const knownHeaderMatches = firstRow.filter(isContactImportHeader).length;

  if (knownHeaderMatches > 0) {
    return true;
  }

  const textLikeCells = firstRow.filter((cell) => /[a-z]/i.test(cell)).length;
  const secondRowDataLikeCells = secondRow.filter((cell) => /@|\d{3,}/.test(cell)).length;
  const firstRowCellCount = firstRow.filter((cell) => cell.trim().length > 0).length;
  const likelyHeaderCellCount = Math.max(2, Math.ceil(firstRowCellCount * 0.75));

  return textLikeCells >= likelyHeaderCellCount && secondRowDataLikeCells > 0;
}
