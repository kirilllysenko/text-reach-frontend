import { getContactUploadUrl, importContacts } from "$lib/api/contact/contact";
import type { ContactImportDto, ContactImportResultDto, ErrorResponse } from "$lib/api/index.schemas";
import { notificationsState } from "$lib/state/notifications.svelte";
import { parseContactImportFile } from "./contact-import-file";
import {
  CONTACT_IMPORT_IGNORE,
  ContactImportMappingState,
  type ContactImportMapping,
  buildContactImportRequest,
} from "./contact-import-mapping.svelte";

export type ContactImportStep = "setup" | "mapping" | "complete";

export interface ContactImportStateOptions {
  onImported: () => Promise<void> | void;
}

export function createContactImportState(options: ContactImportStateOptions): ContactImportState {
  return new ContactImportState(options);
}

export class ContactImportState {
  open = $state(false);
  step = $state<ContactImportStep>("setup");
  error = $state<string | null>(null);
  importedCount = $state<number | null>(null);
  file = $state<File | null>(null);
  contactGroupIds = $state<string[]>([]);
  setupSubmitting = $state(false);
  mapping = new ContactImportMappingState();

  private options: ContactImportStateOptions;

  constructor(options: ContactImportStateOptions) {
    this.options = options;
  }

  get displayError(): string | null {
    return this.error ?? this.mapping.customFieldsError;
  }

  openDialog = (): void => {
    this.open = true;
    void this.mapping.preloadCustomFields();
  };

  closeDialog = (): void => {
    if (this.setupSubmitting || this.mapping.importSubmitting) {
      return;
    }

    this.open = false;
    this.reset();
  };

  reset = (): void => {
    this.step = "setup";
    this.error = null;
    this.importedCount = null;
    this.file = null;
    this.contactGroupIds = [];
    this.setupSubmitting = false;
    this.mapping.reset();
  };

  setFile = (file: File | null): void => {
    if (this.setupSubmitting) {
      return;
    }

    this.file = file;
    this.mapping.reset();
    this.step = "setup";
    this.error = null;
    this.importedCount = null;
  };

  setContactGroupIds = (contactGroupIds: string[]): void => {
    this.contactGroupIds = contactGroupIds;
  };

  returnToSetup = (): void => {
    if (!this.mapping.importSubmitting) {
      this.step = "setup";
    }
  };

  clearError = (): void => {
    this.error = null;
  };

  prepareImport = async (): Promise<void> => {
    const file = this.file;

    if (!file || this.setupSubmitting) {
      return;
    }

    this.setupSubmitting = true;
    this.error = null;

    try {
      await this.mapping.preloadCustomFields();
      const parsedFile = await parseContactImportFile(file);
      const uploadedFilename = await uploadContactImportFile(file);

      this.mapping.applyParsedFile(parsedFile, uploadedFilename);
      this.step = "mapping";
    } catch (error) {
      this.error = error instanceof Error ? error.message : "Could not prepare contacts import.";
    } finally {
      this.setupSubmitting = false;
    }
  };

  importContacts = async (): Promise<void> => {
    if (this.mapping.importSubmitting || !this.mapping.uploadedFilename) {
      return;
    }

    this.mapping.importSubmitting = true;
    this.error = null;

    try {
      const mappings: ContactImportMapping[] = this.mapping.columns.map((column) => ({
        columnIndex: column.index,
        value: this.mapping.mappings[column.index] ?? CONTACT_IMPORT_IGNORE,
      }));
      const request = buildContactImportRequest({
        filename: this.mapping.uploadedFilename,
        contactGroupIds: this.contactGroupIds,
        skipFirstRow: this.mapping.skipFirstRow,
        mappings,
      });
      const result = await submitContactImport(request);

      this.importedCount = result.importedCount;
      this.step = "complete";
      notificationsState.showInfo(`Imported ${result.importedCount} contacts.`);
      await this.options.onImported();
    } catch (error) {
      this.error = error instanceof Error ? error.message : "Could not import contacts.";
    } finally {
      this.mapping.importSubmitting = false;
    }
  };
}

async function uploadContactImportFile(file: File): Promise<string> {
  const upload = await getContactUploadUrl({ filename: file.name }, { credentials: "include" }).catch((error) => {
    throw asContactImportError(error, "Could not start contact file upload.");
  });

  if (upload.status !== 200) {
    throw new Error(toErrorText(upload.data as ErrorResponse, "Could not start contact file upload."));
  }

  const response = await fetch(upload.data.url, {
    method: "PUT",
    headers: { "Content-Type": file.type || getFallbackContentType(file) },
    body: file,
  }).catch((error) => {
    throw asContactImportError(error, "Could not upload contacts file.");
  });

  if (!response.ok) {
    throw new Error("Could not upload contacts file.");
  }

  return upload.data.newFilename;
}

async function submitContactImport(request: ContactImportDto): Promise<ContactImportResultDto> {
  try {
    const response = await importContacts(request, { credentials: "include" });

    if (response.status !== 200) {
      throw new Error(toErrorText(response.data as ErrorResponse, "Could not import contacts."));
    }

    return response.data;
  } catch (error) {
    throw asContactImportError(error, "Could not import contacts.");
  }
}

function toErrorText(error: ErrorResponse | undefined, fallback: string): string {
  return error?.errorDescription ?? fallback;
}

function asContactImportError(error: unknown, fallback: string): Error {
  return error instanceof Error ? error : new Error(fallback);
}

function getFallbackContentType(file: File): string {
  return file.name.toLowerCase().endsWith(".xlsx")
    ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    : "text/csv";
}
