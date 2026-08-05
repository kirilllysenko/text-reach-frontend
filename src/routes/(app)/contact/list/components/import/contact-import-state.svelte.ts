import { CustomFieldsStore, GenerateContactUploadUrlStore, ImportContactsStore } from "$houdini";
import { toGraphQLErrorText } from "$lib/graphql/errors";
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
  private readonly customFieldsQuery = new CustomFieldsStore();
  private readonly generateUploadUrlMutation = new GenerateContactUploadUrlStore();
  private readonly importContactsMutation = new ImportContactsStore();
  step = $state<ContactImportStep>("setup");
  file = $state<File | null>(null);
  contactGroupIds = $state<string[]>([]);
  uploadedFilename = $state("");
  rows = $state<string[][]>([]);
  columns = $state<ContactImportPreviewColumn[]>([]);
  skipFirstRow = $state(false);
  mappings = $state<Record<number, ContactImportMappingValue>>({});
  customFields = $state<{ id: string; name: string }[]>([]);
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
      const response = await this.customFieldsQuery.fetch();

      if (response.errors || !response.data) {
        this.error = toGraphQLErrorText(response.errors);
        return;
      }

      this.customFields = response.data.customFields.map((field) => ({ id: field.id, name: field.name }));
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
      const uploadResponse = await this.generateUploadUrlMutation.mutate({ filename: this.file.name });

      if (uploadResponse.errors || !uploadResponse.data) {
        this.error = toGraphQLErrorText(uploadResponse.errors);
        return;
      }

      const upload = uploadResponse.data.generateContactUploadUrl;

      const uploadResult = await fetch(upload.url, {
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
      this.uploadedFilename = upload.newFilename;
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
      const response = await this.importContactsMutation.mutate({ input: request });

      if (response.errors || !response.data) {
        this.error = toGraphQLErrorText(response.errors);
        return;
      }

      this.importedCount = response.data.importContacts.contactImport.importedRows;
      this.step = "complete";
      notificationsState.showInfo("Contact import has been queued.");
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

function getFallbackContentType(file: File): string {
  return file.name.toLowerCase().endsWith(".xlsx")
    ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    : "text/csv";
}

export type { ContactImportState };
