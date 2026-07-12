import { listCustomFields } from "$lib/api/custom-field/custom-field";
import {
  RegularContactImportFieldDto,
  type ContactImportColumnDto,
  type ContactImportDto,
  type CustomFieldDto,
  type RegularContactImportFieldDto as RegularContactImportField,
  type TableImportFieldDto,
  type Ulid,
} from "$lib/api/index.schemas";
import type { ContactImportParseResult, ContactImportPreviewColumn } from "./contact-import-file";

export const CONTACT_IMPORT_IGNORE = "IGNORE";
export const CONTACT_IMPORT_REGULAR_PREFIX = "REGULAR:";
export const CONTACT_IMPORT_CUSTOM_FIELD_PREFIX = "CUSTOM_FIELD:";

export type ContactImportMappingValue =
  | typeof CONTACT_IMPORT_IGNORE
  | `${typeof CONTACT_IMPORT_REGULAR_PREFIX}${RegularContactImportField}`
  | `${typeof CONTACT_IMPORT_CUSTOM_FIELD_PREFIX}${string}`;

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

export class ContactImportMappingState {
  uploadedFilename = $state("");
  rows = $state<string[][]>([]);
  columns = $state<ContactImportPreviewColumn[]>([]);
  skipFirstRow = $state(false);
  mappings = $state<Record<number, ContactImportMappingValue>>({});
  customFields = $state<CustomFieldDto[]>([]);
  customFieldsError = $state<string | null>(null);
  importSubmitting = $state(false);

  private customFieldsLoaded = false;
  private customFieldsRequest: Promise<void> | null = null;

  reset = (): void => {
    this.uploadedFilename = "";
    this.rows = [];
    this.columns = [];
    this.skipFirstRow = false;
    this.mappings = {};
    this.customFieldsError = null;
    this.importSubmitting = false;
  };

  setSkipFirstRow = (skipFirstRow: boolean): void => {
    this.skipFirstRow = skipFirstRow;
  };

  updateMapping = (columnIndex: number, value: ContactImportMappingValue): void => {
    this.mappings = { ...this.mappings, [columnIndex]: value };
  };

  preloadCustomFields = async (): Promise<void> => {
    if (this.customFieldsLoaded) {
      return;
    }

    if (!this.customFieldsRequest) {
      this.customFieldsRequest = this.requestCustomFields();
    }

    await this.customFieldsRequest;
  };

  applyParsedFile = (parsedFile: ContactImportParseResult, uploadedFilename: string): void => {
    this.uploadedFilename = uploadedFilename;
    this.rows = parsedFile.rows;
    this.columns = parsedFile.columns;
    this.skipFirstRow = parsedFile.skipFirstRow;
    this.mappings = Object.fromEntries(
      parsedFile.columns.map((column) => [column.index, inferContactImportMapping(column, this.customFields)]),
    );
  };

  private requestCustomFields = async (): Promise<void> => {
    try {
      this.customFields = await loadContactImportCustomFields();
      this.customFieldsLoaded = true;
      this.customFieldsError = null;
    } catch (error) {
      this.customFieldsError = error instanceof Error ? error.message : "Could not load custom fields.";
    } finally {
      this.customFieldsRequest = null;
    }
  };
}

export function createRegularContactImportMappingValue(field: RegularContactImportField): ContactImportMappingValue {
  return `${CONTACT_IMPORT_REGULAR_PREFIX}${field}`;
}

export function createCustomContactImportMappingValue(customFieldId: string): ContactImportMappingValue {
  return `${CONTACT_IMPORT_CUSTOM_FIELD_PREFIX}${customFieldId}`;
}

export function inferContactImportMapping(
  column: ContactImportPreviewColumn,
  customFields: Pick<CustomFieldDto, "id" | "name">[],
): ContactImportMappingValue {
  const normalizedLabel = normalizeContactImportHeader(column.label);
  const regularField = contactImportHeaderFieldMap[normalizedLabel];

  if (regularField) {
    return createRegularContactImportMappingValue(regularField);
  }

  const customField = customFields.find((field) => normalizeContactImportHeader(field.name) === normalizedLabel);
  return customField ? createCustomContactImportMappingValue(customField.id) : CONTACT_IMPORT_IGNORE;
}

export function buildContactImportRequest(options: ContactImportBuildOptions): ContactImportDto {
  const fields = buildContactImportFields(options.mappings);
  const error = validateContactImportFields(fields);

  if (error) {
    throw new Error(error);
  }

  return {
    filename: options.filename,
    fields,
    contactGroupIds: options.contactGroupIds as Ulid[],
    skipFirstRow: options.skipFirstRow,
  };
}

export function buildContactImportFields(mappings: ContactImportMapping[]): ContactImportColumnDto[] {
  return mappings.reduce<ContactImportColumnDto[]>((fields, mapping) => {
    const field = toContactImportField(mapping.value);
    return field ? [...fields, { columnIndex: mapping.columnIndex, field }] : fields;
  }, []);
}

export function validateContactImportFields(fields: ContactImportColumnDto[]): string | null {
  const phoneFields = fields.filter(
    (field) => field.field.type === "REGULAR" && field.field.field === RegularContactImportFieldDto.PhoneNumber,
  );

  if (phoneFields.length !== 1) {
    return "Map exactly one column to Phone number.";
  }

  const fieldKeys = fields.map((field) => getContactImportFieldKey(field.field));
  return new Set(fieldKeys).size === fieldKeys.length ? null : "Each contact field can only be mapped once.";
}

export function isContactImportHeader(value: string): boolean {
  return Boolean(contactImportHeaderFieldMap[normalizeContactImportHeader(value)]);
}

function normalizeContactImportHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

async function loadContactImportCustomFields(): Promise<CustomFieldDto[]> {
  const response = await listCustomFields({ credentials: "include" }).catch(() => {
    throw new Error("Could not load custom fields.");
  });

  if (response.status !== 200) {
    throw new Error(response.data.errorDescription ?? "Could not load custom fields.");
  }

  return response.data;
}

function toContactImportField(value: ContactImportMappingValue): TableImportFieldDto | null {
  if (value === CONTACT_IMPORT_IGNORE) {
    return null;
  }

  if (value.startsWith(CONTACT_IMPORT_REGULAR_PREFIX)) {
    return {
      type: "REGULAR",
      field: value.slice(CONTACT_IMPORT_REGULAR_PREFIX.length) as RegularContactImportFieldDto,
    };
  }

  return {
    type: "CUSTOM_FIELD",
    custom_field_id: value.slice(CONTACT_IMPORT_CUSTOM_FIELD_PREFIX.length) as Ulid,
  };
}

function getContactImportFieldKey(field: TableImportFieldDto): string {
  return field.type === "REGULAR"
    ? `${CONTACT_IMPORT_REGULAR_PREFIX}${field.field}`
    : `${CONTACT_IMPORT_CUSTOM_FIELD_PREFIX}${field.custom_field_id}`;
}

const contactImportHeaderFieldMap: Record<string, RegularContactImportField | undefined> = {
  birthday: RegularContactImportFieldDto.Birthday,
  birthdate: RegularContactImportFieldDto.Birthday,
  dob: RegularContactImportFieldDto.Birthday,
  email: RegularContactImportFieldDto.Email,
  emailaddress: RegularContactImportFieldDto.Email,
  firstname: RegularContactImportFieldDto.FirstName,
  fname: RegularContactImportFieldDto.FirstName,
  givenname: RegularContactImportFieldDto.FirstName,
  lastname: RegularContactImportFieldDto.LastName,
  lname: RegularContactImportFieldDto.LastName,
  notes: RegularContactImportFieldDto.Notes,
  phone: RegularContactImportFieldDto.PhoneNumber,
  phonenumber: RegularContactImportFieldDto.PhoneNumber,
  mobile: RegularContactImportFieldDto.PhoneNumber,
  mobilenumber: RegularContactImportFieldDto.PhoneNumber,
};
