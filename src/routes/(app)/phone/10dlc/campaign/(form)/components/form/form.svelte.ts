import type { TenDlcCampaignInput } from "$houdini/graphql/inputs";
import { createForm, type FormSubmitResult } from "$lib/form/form.svelte";
import { z } from "zod";

const requiredText = z.string().trim().min(1, "Required");

export const validator = z
  .object({
    ageGated: z.boolean(),
    description: requiredText,
    directLending: z.boolean(),
    documentUrl: z.string().trim().min(1, "Upload a consent document").pipe(z.url()),
    embeddedLink: z.boolean(),
    embeddedPhone: z.boolean(),
    helpKeywords: requiredText,
    helpMessage: requiredText,
    messageFlow: requiredText,
    numberPool: z.boolean(),
    optInKeywords: z.string(),
    optOutKeywords: requiredText,
    optoutMessage: requiredText,
    sampleMessage1: requiredText,
    sampleMessage2: requiredText,
    termsAndConditions: z.boolean().refine(Boolean, "Accept the terms and conditions"),
    usecase: requiredText,
  })
  .transform(
    (values): TenDlcCampaignInput => ({
      ageGated: values.ageGated,
      description: values.description,
      directLending: values.directLending,
      embeddedLink: values.embeddedLink,
      embeddedPhone: values.embeddedPhone,
      helpKeywords: splitKeywords(values.helpKeywords),
      helpMessage: values.helpMessage,
      messageFlow: `${values.messageFlow}\nConsent documentation: ${values.documentUrl}`,
      numberPool: values.numberPool,
      optInKeywords: splitKeywords(values.optInKeywords),
      optOutKeywords: splitKeywords(values.optOutKeywords),
      optoutMessage: values.optoutMessage,
      sampleMessages: [values.sampleMessage1, values.sampleMessage2],
      subscriberHelp: true,
      subscriberOptIn: true,
      subscriberOptOut: true,
      termsAndConditions: values.termsAndConditions,
      usecase: values.usecase,
    }),
  );

export type FormValues = z.input<typeof validator>;
export type SubmitValues = z.output<typeof validator>;

export const initialValues: FormValues = {
  ageGated: false,
  description: "",
  directLending: false,
  documentUrl: "",
  embeddedLink: false,
  embeddedPhone: false,
  helpKeywords: "HELP, INFO",
  helpMessage: "Reply HELP for help. Message and data rates may apply.",
  messageFlow: "",
  numberPool: false,
  optInKeywords: "START, YES",
  optOutKeywords: "STOP, END, CANCEL, UNSUBSCRIBE",
  optoutMessage: "You have opted out and will receive no further messages. Reply START to opt back in.",
  sampleMessage1: "",
  sampleMessage2: "",
  termsAndConditions: false,
  usecase: "MIXED",
};

export function createTenDlcCampaignForm(onSubmit: (values: SubmitValues) => Promise<FormSubmitResult>) {
  return createForm<FormValues, SubmitValues>(initialValues, validator, onSubmit);
}

function splitKeywords(value: string): string[] {
  return value
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}
