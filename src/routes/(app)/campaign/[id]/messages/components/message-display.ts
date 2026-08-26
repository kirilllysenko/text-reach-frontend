import type { MessageDirection$options } from "$houdini/graphql/enums";

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export const messageDirectionLabelMap: Record<MessageDirection$options, string> = {
  INBOUND: "Inbound",
  OUTBOUND: "Outbound",
};

export function formatMessageDate(value?: string | null, fallback = "Not recorded"): string {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateTimeFormatter.format(date);
}
