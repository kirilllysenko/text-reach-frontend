import { notificationsState } from "$lib/state/notifications.svelte";
import { loadContactExportList, toContactCsv, type ContactExportSnapshot } from "./contact-export";

export function createContactExportState(): ContactExportState {
  return new ContactExportState();
}

class ContactExportState {
  exporting = $state(false);

  exportContact = async (snapshot: ContactExportSnapshot): Promise<void> => {
    if (this.exporting) {
      return;
    }

    this.exporting = true;

    try {
      const contacts = await loadContactExportList(snapshot);
      const blob = new Blob([toContactCsv(contacts)], {
        type: "text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `contact-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      notificationsState.showInfo(`Exported ${contacts.length} contacts with current filters.`);
    } catch {
      notificationsState.showError("Could not export contacts.");
    } finally {
      this.exporting = false;
    }
  };
}

export type { ContactExportState };
