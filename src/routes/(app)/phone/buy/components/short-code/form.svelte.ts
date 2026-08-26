import type { CreateShortCodeApplicationInput } from "$houdini/graphql/inputs";
import { createForm, type FormSubmitResult } from "$lib/form/form.svelte";
import { z } from "zod";

const requiredText = (maxLength = 2_000) => z.string().trim().min(1, "Required").max(maxLength, "Too long");
const shortCodeTypes = ["RANDOM", "VANITY"] as const;

export const validator = z
  .object({
    description: requiredText(),
    estimatedMonthlyVolume: z
      .union([z.string(), z.number().finite()])
      .transform(String)
      .pipe(
        z
          .string()
          .trim()
          .min(1, "Required")
          .regex(/^\d+$/, "Enter a whole number")
          .refine((value) => Number(value) > 0, "Enter a volume greater than zero")
          .refine((value) => Number(value) <= 2_147_483_647, "Volume is too large"),
      ),
    helpKeywords: z.string(),
    helpMessage: requiredText(500),
    messageFlow: requiredText(),
    optInEvidenceUrls: requiredText(),
    optInKeywords: z.string(),
    optOutKeywords: z.string(),
    requestedShortCode: z.string().trim(),
    sampleMessage1: requiredText(1_600),
    sampleMessage2: requiredText(1_600),
    shortCodeType: z.enum(shortCodeTypes),
    useCase: requiredText(255),
  })
  .superRefine((values, context) => {
    if (values.shortCodeType === "VANITY" && !/^\d{5,6}$/.test(values.requestedShortCode)) {
      context.addIssue({
        code: "custom",
        message: "Enter a 5 or 6 digit short code",
        path: ["requestedShortCode"],
      });
    }

    for (const value of splitLines(values.optInEvidenceUrls)) {
      if (!z.url().safeParse(value).success) {
        context.addIssue({
          code: "custom",
          message: "Enter complete URLs, one per line",
          path: ["optInEvidenceUrls"],
        });
        break;
      }
    }
  })
  .transform(
    (values): CreateShortCodeApplicationInput => ({
      description: values.description,
      estimatedMonthlyVolume: Number(values.estimatedMonthlyVolume),
      helpKeywords: splitKeywords(values.helpKeywords),
      helpMessage: values.helpMessage,
      messageFlow: values.messageFlow,
      optInEvidenceUrls: splitLines(values.optInEvidenceUrls),
      optInKeywords: splitKeywords(values.optInKeywords),
      optOutKeywords: splitKeywords(values.optOutKeywords),
      requestedShortCode: values.shortCodeType === "VANITY" ? values.requestedShortCode : null,
      sampleMessages: [values.sampleMessage1, values.sampleMessage2],
      shortCodeType: values.shortCodeType,
      useCase: values.useCase,
    }),
  );

export type FormValues = z.input<typeof validator>;
export type SubmitValues = z.output<typeof validator>;

export const initialValues: FormValues = {
  description: "",
  estimatedMonthlyVolume: "",
  helpKeywords: "HELP, INFO",
  helpMessage: "Reply HELP for help. Message and data rates may apply.",
  messageFlow: "",
  optInEvidenceUrls: "",
  optInKeywords: "START, YES",
  optOutKeywords: "STOP, END, CANCEL, UNSUBSCRIBE",
  requestedShortCode: "",
  sampleMessage1: "",
  sampleMessage2: "",
  shortCodeType: "RANDOM",
  useCase: "",
};

export function createShortCodeApplicationForm(onSubmit: (values: SubmitValues) => Promise<FormSubmitResult>) {
  return createForm<FormValues, SubmitValues>(initialValues, validator, onSubmit);
}

function splitKeywords(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((keyword) => keyword.trim().toUpperCase())
    .filter(Boolean);
}

function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
