import Papa from "papaparse";
import type { ExportMessages$result } from "$houdini/artifacts/ExportMessages";

export type MessageExportItem = ExportMessages$result["messages"]["edges"][number]["node"];

export const messageExportHeaders = [
  "Message ID",
  "Campaign ID",
  "Contact ID",
  "Conversation ID",
  "Tenant Phone ID",
  "Tenant Phone Number",
  "Direction",
  "Status",
  "Created At",
  "Sent At",
  "Received At",
  "Text",
  "Media URLs",
  "Media Content Types",
  "Media Sizes (Bytes)",
] as const;

export function createMessageExportCsv(messages: MessageExportItem[]): string {
  const data = messages.map((message) => [
    message.id,
    message.campaign?.id ?? "",
    message.contact?.id ?? "",
    message.conversation.id,
    message.tenantPhone.id,
    message.tenantPhoneNumber,
    message.direction,
    message.status,
    message.createdAt,
    message.sentAt ?? "",
    message.receivedAt ?? "",
    message.text,
    message.media.map((media) => media.url).join(" "),
    message.media.map((media) => media.contentType).join(" "),
    message.media.map((media) => media.sizeBytes ?? "").join(" "),
  ]);

  return Papa.unparse(
    {
      fields: [...messageExportHeaders],
      data,
    },
    { escapeFormulae: true },
  );
}

export function createMessageExportFilename(date = new Date()): string {
  return `campaign-messages-${date.toISOString().slice(0, 10)}.csv`;
}

export function downloadMessageExport(csv: string, filename: string): void {
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.hidden = true;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
