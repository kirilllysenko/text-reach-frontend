import { getContactUploadUrl, importContacts } from "$lib/api/contact/contact";
import { listCustomFields } from "$lib/api/custom-field/custom-field";
import type { CustomFieldDto, ErrorResponse } from "$lib/api/index.schemas";
import { notificationsState } from "$lib/state/notifications.svelte";
import {
  buildContactImportRequest,
  CONTACT_IMPORT_IGNORE,
  createContactImportMappingOptions,
  getContactImportPreviewRows,
  inferContactImportMapping,
  parseContactImportFile,
  type ContactImportMappingValue,
  type ContactImportParseResult,
  type ContactImportPreviewColumn,
} from "./contact-import";

type ContactImportStep = "setup" | "mapping" | "complete";

interface ContactImportStateOptions {
  refreshTable: () => Promise<void> | void;
}

export interface ContactTableReloadTarget {
  handlers: {
    dataLoading: {
      reload: () => Promise<unknown> | void;
    };
  };
}

export function createContactImportState(table: ContactTableReloadTarget): ContactImportState {
  return new ContactImportState({
    async refreshTable() {
      await table.handlers.dataLoading.reload();
    },
  });
}

class ContactImportState {
  step = $state<ContactImportStep>("setup");
  file = $state<File | null>(null);
  contactGroupIds = $state<string[]>([]);
  uploadedFilename = $state("");
  rows = $state<string[][]>([]);
  columns = $state<ContactImportPreviewColumn[]>([]);
  skipFirstRow = $state(false);
  mappings = $state<Record<number, ContactImportMappingValue>>({});
  customFields = $state<CustomFieldDto[]>([]);
  customFieldsLoading = $state(false);
  customFieldsLoaded = $state(false);
  setupSubmitting = $state(false);
  importSubmitting = $state(false);
  error = $state<string | null>(null);
  importedCount = $state<number | null>(null);

  private options: ContactImportStateOptions;

  constructor(options: ContactImportStateOptions) {
    this.options = options;
  }

  mappingOptions = $derived(createContactImportMappingOptions(this.customFields));
  previewRows = $derived(getContactImportPreviewRows(this.rows, this.skipFirstRow));
  selectedFileName = $derived(this.file?.name ?? "No file selected");
  canContinue = $derived(Boolean(this.file) && !this.setupSubmitting);
  canImport = $derived(Boolean(this.uploadedFilename) && !this.importSubmitting && this.step === "mapping");

  reset = (): void => {
    this.step = "setup";
    this.file = null;
    this.contactGroupIds = [];
    this.uploadedFilename = "";
    this.rows = [];
    this.columns = [];
    this.skipFirstRow = false;
    this.mappings = {};
    this.setupSubmitting = false;
    this.importSubmitting = false;
    this.error = null;
    this.importedCount = null;
  };

  setFile = (file: File | null): void => {
    this.file = file;
    this.uploadedFilename = "";
    this.rows = [];
    this.columns = [];
    this.mappings = {};
    this.step = "setup";
    this.error = null;
    this.importedCount = null;
  };

  setContactGroupIds = (contactGroupIds: string[]): void => {
    this.contactGroupIds = contactGroupIds;
  };

  setSkipFirstRow = (skipFirstRow: boolean): void => {
    this.skipFirstRow = skipFirstRow;
  };

  updateMapping = (columnIndex: number, value: ContactImportMappingValue): void => {
    this.mappings = {
      ...this.mappings,
      [columnIndex]: value,
    };
    this.error = null;
  };

  getMappingOption = (value: ContactImportMappingValue) =>
    this.mappingOptions.find((option) => option.id === value) ?? this.mappingOptions[0];

  loadCustomFields = async (): Promise<void> => {
    if (this.customFieldsLoaded || this.customFieldsLoading) {
      return;
    }

    this.customFieldsLoading = true;

    try {
      const response = await listCustomFields({ credentials: "include" });

      if (response.status !== 200) {
        this.error = toErrorText(response.data as ErrorResponse, "Could not load custom fields.");
        return;
      }

      this.customFields = response.data;
      this.customFieldsLoaded = true;
    } catch {
      this.error = "Could not load custom fields.";
    } finally {
      this.customFieldsLoading = false;
    }
  };

  continueToMapping = async (): Promise<void> => {
    if (!this.file || this.setupSubmitting) {
      return;
    }

    this.setupSubmitting = true;
    this.error = null;

    try {
      await this.loadCustomFields();
      const parsedFile = await parseContactImportFile(this.file);
      const uploadResponse = await getContactUploadUrl({ filename: this.file.name }, { credentials: "include" });

      if (uploadResponse.status !== 200) {
        this.error = toErrorText(uploadResponse.data as ErrorResponse, "Could not start contact file upload.");
        return;
      }

      const uploadResult = await fetch(uploadResponse.data.url, {
        method: "PUT",
        headers: {
          "Content-Type": this.file.type || getFallbackContentType(this.file),
        },
        body: this.file,
      });

      if (!uploadResult.ok) {
        this.error = "Could not upload contacts file.";
        return;
      }

      this.applyParsedFile(parsedFile);
      this.uploadedFilename = uploadResponse.data.newFilename;
      this.step = "mapping";
    } catch (error) {
      this.error = error instanceof Error ? error.message : "Could not prepare contacts import.";
    } finally {
      this.setupSubmitting = false;
    }
  };

  importContacts = async (): Promise<void> => {
    if (this.importSubmitting || !this.uploadedFilename) {
      return;
    }

    this.importSubmitting = true;
    this.error = null;

    try {
      const request = buildContactImportRequest({
        filename: this.uploadedFilename,
        contactGroupIds: this.contactGroupIds,
        skipFirstRow: this.skipFirstRow,
        mappings: this.columns.map((column) => ({
          columnIndex: column.index,
          value: this.mappings[column.index] ?? CONTACT_IMPORT_IGNORE,
        })),
      });
      const response = await importContacts(request, { credentials: "include" });

      if (response.status !== 200) {
        this.error = toErrorText(response.data as ErrorResponse, "Could not import contacts.");
        return;
      }

      this.importedCount = response.data.importedCount;
      this.step = "complete";
      notificationsState.showInfo(`Imported ${response.data.importedCount} contacts.`);
      await this.options.refreshTable();
    } catch (error) {
      this.error = error instanceof Error ? error.message : "Could not import contacts.";
    } finally {
      this.importSubmitting = false;
    }
  };

  private applyParsedFile(parsedFile: ContactImportParseResult): void {
    this.rows = parsedFile.rows;
    this.columns = parsedFile.columns;
    this.skipFirstRow = parsedFile.skipFirstRow;
    this.mappings = Object.fromEntries(
      parsedFile.columns.map((column) => [column.index, inferContactImportMapping(column, this.customFields)]),
    );
  }
}

function toErrorText(error: ErrorResponse | undefined, fallback: string): string {
  return error?.errorDescription ?? fallback;
}

function getFallbackContentType(file: File): string {
  return file.name.toLowerCase().endsWith(".xlsx")
    ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    : "text/csv";
}

export type { ContactImportState };
