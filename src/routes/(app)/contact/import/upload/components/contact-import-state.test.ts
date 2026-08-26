import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("$houdini", () => ({
  ContactImportCustomFieldsQueryStore: class {},
  GenerateContactUploadUrlStore: class {},
  ImportContactsStore: class {},
}));

vi.mock("text-reach-frontend-library/state/notifications.svelte", () => ({
  notificationsState: {
    showInfo: vi.fn(),
  },
}));

import { createContactImportState } from "./contact-import-state.svelte";

describe("contact import consent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires consent for the selected file before continuing", () => {
    const contactImport = createContactImportState({ onQueued: vi.fn() });

    contactImport.setFile(new File(["phone\n5551234567"], "contacts.csv", { type: "text/csv" }));

    expect(contactImport.canContinue).toBe(false);

    contactImport.setConsentConfirmed(true);

    expect(contactImport.canContinue).toBe(true);
  });

  it("clears consent when the selected file changes", () => {
    const contactImport = createContactImportState({ onQueued: vi.fn() });

    contactImport.setFile(new File(["phone\n5551234567"], "contacts.csv", { type: "text/csv" }));
    contactImport.setConsentConfirmed(true);
    contactImport.setFile(new File(["phone\n5559876543"], "replacement.csv", { type: "text/csv" }));

    expect(contactImport.consentConfirmed).toBe(false);
    expect(contactImport.canContinue).toBe(false);
  });
});
