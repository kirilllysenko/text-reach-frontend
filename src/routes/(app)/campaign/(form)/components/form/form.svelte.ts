import type { CreateCampaignInput } from "$houdini/graphql/inputs";
import { createForm, type FormSubmitResult } from "$lib/form/form.svelte";
import { z } from "zod";
import type { CampaignMediaDraft } from "../message/images/media";
import { toMessageTemplate, type MessagePart } from "../message/message";

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
    tenantPhoneId: z.string().refine((value) => z.ulid().safeParse(value).success, "Select a sending number"),
  })
  .transform(
    (values): CreateCampaignInput => ({
      contactGroupIds: values.contactGroupIds,
      media: values.media.map((media) => ({
        contentType: media.contentType,
        sizeBytes: media.sizeBytes,
        url: media.url,
      })),
      messageTemplate: toMessageTemplate(values.messageParts).trim(),
      name: values.name,
      tenantPhoneId: values.tenantPhoneId,
    }),
  );

export interface FormValues {
  contactGroupIds: string[];
  media: CampaignMediaDraft[];
  messageParts: MessagePart[];
  name: string;
  tenantPhoneId: string;
}

export type SubmitValues = z.output<typeof validator>;

export const initialValues: FormValues = {
  contactGroupIds: [],
  media: [],
  messageParts: [{ id: "campaign-message-initial-text", type: "text", value: "" }],
  name: "",
  tenantPhoneId: "",
};

export function createCampaignForm(onSubmit: (values: SubmitValues) => Promise<FormSubmitResult>) {
  return createForm<FormValues, SubmitValues>(initialValues, validator, onSubmit);
}
