export type ContactFieldKey = "birthday" | "email" | "firstName" | "lastName" | "phoneNumber";

export interface ContactFieldOption {
  example: string;
  key: ContactFieldKey;
  label: string;
}

export interface MessageTextPart {
  id: string;
  type: "text";
  value: string;
}

export interface MessageFieldPart {
  id: string;
  key: ContactFieldKey;
  label: string;
  type: "field";
}

export type MessagePart = MessageTextPart | MessageFieldPart;

export const contactFieldOptions: ContactFieldOption[] = [
  { example: "Avery", key: "firstName", label: "First name" },
  { example: "Johnson", key: "lastName", label: "Last name" },
  { example: "avery@example.com", key: "email", label: "Email" },
  { example: "+1 415 555 0127", key: "phoneNumber", label: "Phone number" },
  { example: "December 10, 1990", key: "birthday", label: "Birthday" },
];

let nextPartId = 0;

export function createMessagePartId(): string {
  nextPartId += 1;
  return `campaign-message-part-${nextPartId}`;
}

export function createTextPart(value = ""): MessageTextPart {
  return { id: createMessagePartId(), type: "text", value };
}

export function createFieldPart(field: ContactFieldOption): MessageFieldPart {
  return { id: createMessagePartId(), key: field.key, label: field.label, type: "field" };
}

export function toMessageTemplate(parts: MessagePart[]): string {
  return parts.map((part) => (part.type === "field" ? `{{${part.key}}}` : part.value)).join("");
}

export function toPreviewText(parts: MessagePart[]): string {
  const examples = new Map(contactFieldOptions.map((field) => [field.key, field.example]));
  return parts.map((part) => (part.type === "field" ? (examples.get(part.key) ?? part.label) : part.value)).join("");
}

export function smsSegmentCount(text: string): number {
  if (text.length === 0) {
    return 0;
  }

  const unicode = /[^\x00-\x7F]/.test(text);
  const singleSegmentLength = unicode ? 70 : 160;
  const multiSegmentLength = unicode ? 67 : 153;
  return text.length <= singleSegmentLength ? 1 : Math.ceil(text.length / multiSegmentLength);
}
