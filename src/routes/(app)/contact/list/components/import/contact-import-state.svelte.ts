import type { ErrorResponse } from "$lib/api/index.schemas";
import { getContactUploadUrl } from "$lib/api/contact/contact";

interface ContactImportStateOptions {
  refreshTable: () => Promise<void> | void;
}

export class ContactImportState {
  actionMessage = $state<string | null>(null);
  importing = $state(false);

  private options: ContactImportStateOptions;

  constructor(options: ContactImportStateOptions) {
    this.options = options;
  }

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
