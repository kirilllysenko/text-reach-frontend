import Papa from "papaparse";
import { describe, expect, it } from "vitest";
import {
  createMessageExportCsv,
  createMessageExportFilename,
  messageExportHeaders,
  type MessageExportItem,
} from "./message-export";

const message: MessageExportItem = {
  campaign: { id: "campaign-1" },
  contact: { id: "contact-1" },
  conversation: { id: "conversation-1" },
  createdAt: "2026-08-17T10:00:00Z",
  direction: "OUTBOUND",
  id: "message-1",
  media: [
    { contentType: "image/png", sizeBytes: 42, url: "https://example.com/one.png" },
    { contentType: "image/jpeg", sizeBytes: null, url: "https://example.com/two.jpg" },
  ],
  receivedAt: null,
  sentAt: "2026-08-17T10:01:00Z",
  status: "SENT",
  tenantPhone: { id: "tenant-phone-1" },
  tenantPhoneNumber: "+15555550100",
  text: "=1+1",
};

describe("message export", () => {
  it("creates a safe CSV with stable columns and all inspection fields", () => {
    const parsed = Papa.parse<string[]>(createMessageExportCsv([message]));

    expect(parsed.errors).toEqual([]);
    expect(parsed.data[0]).toEqual([...messageExportHeaders]);
    expect(parsed.data[1]).toEqual([
      "message-1",
      "campaign-1",
      "contact-1",
      "conversation-1",
      "tenant-phone-1",
      "'+15555550100",
      "OUTBOUND",
      "SENT",
      "2026-08-17T10:00:00Z",
      "2026-08-17T10:01:00Z",
      "",
      "'=1+1",
      "https://example.com/one.png https://example.com/two.jpg",
      "image/png image/jpeg",
      "42 ",
    ]);
  });

  it("uses an ISO date in the download filename", () => {
    expect(createMessageExportFilename(new Date("2026-08-17T23:59:59Z"))).toBe("campaign-messages-2026-08-17.csv");
  });
});
