import { ContactImportCustomFieldsQueryStore, GenerateContactUploadUrlStore, ImportContactsStore } from "$houdini";
import { toGraphQLErrorText } from "$lib/graphql/errors";
import { getNotificationsState, type NotificationsState } from "$lib/state/notifications.svelte";
import { createContext } from "svelte";
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
  onQueued: (jobId: string) => Promise<void> | void;
  notifications?: Pick<NotificationsState, "showInfo">;
}

export function createContactImportState(options: ContactImportStateOptions) {
  const notificationsState = options.notifications ?? getNotificationsState();
  const customFieldsQuery = new ContactImportCustomFieldsQueryStore();
  const generateUploadUrlMutation = new GenerateContactUploadUrlStore();
  const importContactsMutation = new ImportContactsStore();

  const setup = $state({
    file: null as File | null,
    contactGroupIds: [] as string[],
    consentConfirmed: false,
    submitting: false,
  });
  const mapping = $state({
    uploadedFilename: "",
    rows: [] as string[][],
    columns: [] as ContactImportPreviewColumn[],
    skipFirstRow: false,
    values: {} as Record<number, ContactImportMappingValue>,
  });
  const fields = $state({
    items: [] as { id: string; name: string }[],
    loading: false,
    loaded: false,
  });
  const request = $state({
    step: "setup" as ContactImportStep,
    submitting: false,
    error: null as string | null,
  });

  const mappingOptions = $derived(createContactImportMappingOptions(fields.items));
  const previewRows = $derived(getContactImportPreviewRows(mapping.rows, mapping.skipFirstRow));

  function reset(): void {
    setup.file = null;
    setup.contactGroupIds = [];
    setup.consentConfirmed = false;
    setup.submitting = false;
    mapping.uploadedFilename = "";
    mapping.rows = [];
    mapping.columns = [];
    mapping.skipFirstRow = false;
    mapping.values = {};
    request.step = "setup";
    request.submitting = false;
    request.error = null;
  }

  function setFile(file: File | null): void {
    setup.file = file;
    setup.consentConfirmed = false;
    mapping.uploadedFilename = "";
    mapping.rows = [];
    mapping.columns = [];
    mapping.values = {};
    request.step = "setup";
    request.error = null;
  }

  function setContactGroupIds(contactGroupIds: string[]): void {
    setup.contactGroupIds = contactGroupIds;
  }

  function setConsentConfirmed(consentConfirmed: boolean): void {
    setup.consentConfirmed = consentConfirmed;
    request.error = null;
  }

  function setSkipFirstRow(skipFirstRow: boolean): void {
    mapping.skipFirstRow = skipFirstRow;
  }

  function updateMapping(columnIndex: number, value: ContactImportMappingValue): void {
    mapping.values = {
      ...mapping.values,
      [columnIndex]: value,
    };
    request.error = null;
  }

  function getMappingOption(value: ContactImportMappingValue) {
    return mappingOptions.find((option) => option.id === value) ?? mappingOptions[0];
  }

  async function loadCustomFields(): Promise<void> {
    if (fields.loaded || fields.loading) {
      return;
    }

    fields.loading = true;

    try {
      const response = await customFieldsQuery.fetch();

      if (response.errors || !response.data) {
        request.error = toGraphQLErrorText(response.errors);
        return;
      }

      fields.items = response.data.customFields.map((field) => ({ id: field.id, name: field.name }));
      fields.loaded = true;
    } catch {
      request.error = "Could not load custom fields.";
    } finally {
      fields.loading = false;
    }
  }

  async function continueToMapping(): Promise<void> {
    if (!setup.file || !setup.consentConfirmed || setup.submitting) {
      return;
    }

    setup.submitting = true;
    request.error = null;

    try {
      await loadCustomFields();
      const parsedFile = await parseContactImportFile(setup.file);
      const uploadResponse = await generateUploadUrlMutation.mutate({ filename: setup.file.name });

      if (uploadResponse.errors || !uploadResponse.data) {
        request.error = toGraphQLErrorText(uploadResponse.errors);
        return;
      }

      const upload = uploadResponse.data.generateContactUploadUrl;
      const uploadResult = await fetch(upload.url, {
        method: "PUT",
        headers: {
          "Content-Type": setup.file.type || getFallbackContentType(setup.file),
        },
        body: setup.file,
      });

      if (!uploadResult.ok) {
        request.error = "Could not upload contacts file.";
        return;
      }

      applyParsedFile(parsedFile);
      mapping.uploadedFilename = upload.newFilename;
      request.step = "mapping";
    } catch (error) {
      request.error = error instanceof Error ? error.message : "Could not prepare contacts import.";
    } finally {
      setup.submitting = false;
    }
  }

  async function importContacts(): Promise<void> {
    if (request.submitting || !mapping.uploadedFilename) {
      return;
    }

    request.submitting = true;
    request.error = null;

    try {
      const input = buildContactImportRequest({
        filename: mapping.uploadedFilename,
        contactGroupIds: setup.contactGroupIds,
        skipFirstRow: mapping.skipFirstRow,
        mappings: mapping.columns.map((column) => ({
          columnIndex: column.index,
          value: mapping.values[column.index] ?? CONTACT_IMPORT_IGNORE,
        })),
      });
      const response = await importContactsMutation.mutate({ input });

      if (response.errors || !response.data) {
        request.error = toGraphQLErrorText(response.errors);
        return;
      }

      request.step = "complete";
      notificationsState.showInfo("Contact import has been queued.");
      await options.onQueued(response.data.importContacts.contactImport.id);
    } catch (error) {
      request.error = error instanceof Error ? error.message : "Could not import contacts.";
    } finally {
      request.submitting = false;
    }
  }

  function applyParsedFile(parsedFile: ContactImportParseResult): void {
    mapping.rows = parsedFile.rows;
    mapping.columns = parsedFile.columns;
    mapping.skipFirstRow = parsedFile.skipFirstRow;
    mapping.values = Object.fromEntries(
      parsedFile.columns.map((column) => [column.index, inferContactImportMapping(column, fields.items)]),
    );
  }

  return {
    get step() {
      return request.step;
    },
    set step(value: ContactImportStep) {
      request.step = value;
    },
    get file() {
      return setup.file;
    },
    get contactGroupIds() {
      return setup.contactGroupIds;
    },
    get consentConfirmed() {
      return setup.consentConfirmed;
    },
    get uploadedFilename() {
      return mapping.uploadedFilename;
    },
    get rows() {
      return mapping.rows;
    },
    get columns() {
      return mapping.columns;
    },
    get skipFirstRow() {
      return mapping.skipFirstRow;
    },
    get mappings() {
      return mapping.values;
    },
    get mappingOptions() {
      return mappingOptions;
    },
    get previewRows() {
      return previewRows;
    },
    get selectedFileName() {
      return setup.file?.name ?? "No file selected";
    },
    get canContinue() {
      return Boolean(setup.file) && setup.consentConfirmed && !setup.submitting;
    },
    get canImport() {
      return Boolean(mapping.uploadedFilename) && !request.submitting && request.step === "mapping";
    },
    get setupSubmitting() {
      return setup.submitting;
    },
    get importSubmitting() {
      return request.submitting;
    },
    get error() {
      return request.error;
    },
    reset,
    setFile,
    setContactGroupIds,
    setConsentConfirmed,
    setSkipFirstRow,
    updateMapping,
    getMappingOption,
    loadCustomFields,
    continueToMapping,
    importContacts,
  };
}

function getFallbackContentType(file: File): string {
  return file.name.toLowerCase().endsWith(".xlsx")
    ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    : "text/csv";
}

export type ContactImportState = ReturnType<typeof createContactImportState>;

export const [getContactImportState, setContactImportState] = createContext<ContactImportState>();
