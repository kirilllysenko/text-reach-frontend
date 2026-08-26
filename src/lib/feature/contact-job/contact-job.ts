export type ContactJobStatus = "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

export function isActiveContactJob(status: ContactJobStatus): boolean {
  return status === "QUEUED" || status === "PROCESSING";
}

export function formatContactJobDate(value: string): string {
  const date = new Date(value);
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();

  return isToday ? `Today, ${timeFormatter.format(date)}` : dateFormatter.format(date);
}

export function contactJobCutoff(): number {
  return Date.now() - 30 * 24 * 60 * 60 * 1000;
}

export function formatRowCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function contactExportProgress(processedRows: number, totalRows: number): number {
  if (totalRows <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((processedRows / totalRows) * 100));
}

export function formatFileSize(value?: number | null): string {
  if (!value || value <= 0) {
    return "—";
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(value / 1_000))} KB`;
}
