import type { ErrorResponse } from "$lib/api/index.schemas";
import { getContactUploadUrl } from "$lib/api/contact/contact";
import type { ContactGroupLookupState } from "./contact-group-lookup-state.svelte";
import { loadContactExportList, toContactCsv, type ContactExportSnapshot } from "./contact-transfer";

interface ContactTransferStateOptions {
  groups: ContactGroupLookupState;
  refreshTable: () => Promise<void> | void;
}

export class ContactTransferState {
  actionMessage = $state<string | null>(null);
  importing = $state(false);
  exporting = $state(false);

  private options: ContactTransferStateOptions;

  constructor(options: ContactTransferStateOptions) {
    this.options = options;
  }

  exportContact = async (snapshot: ContactExportSnapshot): Promise<void> => {
    if (this.exporting) {
      return;
    }

    this.exporting = true;
    this.actionMessage = null;

    try {
      const contacts = await loadContactExportList(snapshot);
      const blob = new Blob([toContactCsv(contacts, this.options.groups.contactGroupNameById)], {
        type: "text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `contact-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      this.actionMessage = `Exported ${contacts.length} contacts with current filters.`;
    } catch {
      this.actionMessage = "Could not export contacts.";
    } finally {
      this.exporting = false;
    }
  };

  importContact = async (file: File): Promise<void> => {
    if (this.importing) {
      return;
    }

    this.importing = true;
    this.actionMessage = null;

    try {
      const uploadResponse = await getContactUploadUrl({ filename: file.name }, { credentials: "include" });

      if (uploadResponse.status !== 200) {
        this.actionMessage = (uploadResponse.data as ErrorResponse).errorDescription ?? "Could not start import.";
        return;
      }

      const uploadResult = await fetch(uploadResponse.data.url, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "text/csv",
        },
        body: file,
      });

      if (!uploadResult.ok) {
        this.actionMessage = "Could not upload contacts file.";
        return;
      }

      this.actionMessage = `Imported ${uploadResponse.data.newFilename}.`;
      await this.options.refreshTable();
    } catch {
      this.actionMessage = "Could not import contacts.";
    } finally {
      this.importing = false;
    }
  };
}
