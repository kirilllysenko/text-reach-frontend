import type { ContactGroupLookupState } from "../contact-group-lookup-state.svelte";
import { loadContactExportList, toContactCsv, type ContactExportSnapshot } from "./contact-export";

interface ContactExportStateOptions {
  groups: ContactGroupLookupState;
}

export class ContactExportState {
  actionMessage = $state<string | null>(null);
  exporting = $state(false);

  private options: ContactExportStateOptions;

  constructor(options: ContactExportStateOptions) {
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
}
