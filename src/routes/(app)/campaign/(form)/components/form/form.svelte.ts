import type { CreateCampaignInput } from "$houdini/graphql/inputs";
import { createForm, type FormSubmitResult } from "$lib/form/form.svelte";
import { z } from "zod";
import type { CampaignMediaDraft } from "../message/images/media";
import { toMessageTemplate, type MessagePart } from "../message/message";

export type CampaignScheduleType = "now" | "once" | "recurring";
export type CampaignRecurrenceFrequency = "DAILY" | "WEEKLY" | "MONTHLY";

const messagePartSchema = z.discriminatedUnion("type", [
  z.object({ id: z.string(), type: z.literal("text"), value: z.string() }),
  z.object({
    id: z.string(),
    key: z.enum(["birthday", "email", "firstName", "lastName", "phoneNumber"]),
    label: z.string(),
    type: z.literal("field"),
  }),
]);

const mediaSchema = z.object({
  contentType: z.string().min(1),
  filename: z.string().min(1),
  id: z.string().min(1),
  previewUrl: z.string().min(1),
  sizeBytes: z.number().positive(),
  url: z.string().min(1),
});

export const validator = z
  .object({
    contactGroupIds: z.array(z.ulid()).min(1, "Add at least one contact group"),
    media: z.array(mediaSchema).max(10, "A campaign can include at most 10 images"),
    messageParts: z.array(messagePartSchema).refine((parts) => toMessageTemplate(parts).trim().length > 0, "Required"),
    name: z.string().trim().min(1, "Required"),
    recurrenceCount: z.string(),
    recurrenceFrequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
    recurrenceInterval: z.string(),
    scheduledAt: z.string(),
    scheduleType: z.enum(["now", "once", "recurring"]),
    tenantPhoneId: z.string().refine((value) => z.ulid().safeParse(value).success, "Select a sending number"),
  })
  .superRefine((values, context) => {
    if (values.scheduleType === "now") {
      return;
    }

    const scheduledAt = parseLocalDateTime(values.scheduledAt);
    if (!scheduledAt) {
      context.addIssue({ code: "custom", message: "Choose a date and time", path: ["scheduledAt"] });
    } else if (scheduledAt.getTime() <= Date.now()) {
      context.addIssue({ code: "custom", message: "Choose a future date and time", path: ["scheduledAt"] });
    }

    if (values.scheduleType !== "recurring") {
      return;
    }

    validateWholeNumber(values.recurrenceInterval, 1, 100, "Repeat every must be between 1 and 100", [
      "recurrenceInterval",
    ]);
    validateWholeNumber(values.recurrenceCount, 2, 365, "Occurrences must be between 2 and 365", ["recurrenceCount"]);

    function validateWholeNumber(
      value: string,
      minimum: number,
      maximum: number,
      message: string,
      path: string[],
    ): void {
      const number = Number(value);
      if (!Number.isInteger(number) || number < minimum || number > maximum) {
        context.addIssue({ code: "custom", message, path });
      }
    }
  })
  .transform((values): CreateCampaignInput => {
    const input: CreateCampaignInput = {
      contactGroupIds: values.contactGroupIds,
      media: values.media.map((media) => ({
        contentType: media.contentType,
        sizeBytes: media.sizeBytes,
        url: media.url,
      })),
      messageTemplate: toMessageTemplate(values.messageParts).trim(),
      name: values.name,
      tenantPhoneId: values.tenantPhoneId,
    };

    if (values.scheduleType === "once") {
      input.scheduledAt = parseLocalDateTime(values.scheduledAt)?.toISOString();
    }

    if (values.scheduleType === "recurring") {
      input.recurrenceRule = buildRecurrenceRule(values);
    }

    return input;
  });

export interface FormValues {
  contactGroupIds: string[];
  media: CampaignMediaDraft[];
  messageParts: MessagePart[];
  name: string;
  recurrenceCount: string;
  recurrenceFrequency: CampaignRecurrenceFrequency;
  recurrenceInterval: string;
  scheduledAt: string;
  scheduleType: CampaignScheduleType;
  tenantPhoneId: string;
}

export type SubmitValues = z.output<typeof validator>;

export const initialValues: FormValues = {
  contactGroupIds: [],
  media: [],
  messageParts: [{ id: "campaign-message-initial-text", type: "text", value: "" }],
  name: "",
  recurrenceCount: "2",
  recurrenceFrequency: "WEEKLY",
  recurrenceInterval: "1",
  scheduledAt: "",
  scheduleType: "now",
  tenantPhoneId: "",
};

export function createCampaignForm(onSubmit: (values: SubmitValues) => Promise<FormSubmitResult>) {
  return createForm<FormValues, SubmitValues>(initialValues, validator, onSubmit);
}

export function buildRecurrenceRule(
  values: Pick<FormValues, "recurrenceCount" | "recurrenceFrequency" | "recurrenceInterval" | "scheduledAt">,
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
): string {
  const dateTime = values.scheduledAt.replaceAll("-", "").replaceAll(":", "");
  const start = dateTime.length === 13 ? `${dateTime}00` : dateTime;

  return [
    `DTSTART;TZID=${timeZone}:${start}`,
    `RRULE:FREQ=${values.recurrenceFrequency};INTERVAL=${Number(values.recurrenceInterval)};COUNT=${Number(values.recurrenceCount)}`,
  ].join("\n");
}

function parseLocalDateTime(value: string): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
