import { dollarsToUsdMicros } from "$lib/feature/payment/payment-display";
import { createForm, type FormSubmitResult } from "text-reach-frontend-library/form";
import { z } from "zod";

export interface FormValues {
  customAmount: number | string;
  selectedPreset: number;
}

export interface SubmitValues {
  amountUsdMicros: number;
}

export const initialValues: FormValues = {
  customAmount: "" as number | string,
  selectedPreset: 10,
};

export const validator = z
  .object({
    customAmount: z.union([z.string(), z.number()]),
    selectedPreset: z.number().positive(),
  })
  .superRefine((values, context) => {
    const amount = selectedTopUpAmountDollars(values);
    if (!Number.isFinite(amount) || amount <= 0) {
      context.addIssue({
        code: "custom",
        message: "Enter a valid amount",
        path: ["customAmount"],
      });
    }
  })
  .transform((values) => ({ amountUsdMicros: selectedTopUpAmountMicros(values) }));

export function createTopUpForm(onSubmit: (values: SubmitValues) => Promise<FormSubmitResult>) {
  return createForm<FormValues, SubmitValues>(initialValues, validator, onSubmit);
}

export function selectedTopUpAmountMicros(values: FormValues): number {
  const amount = selectedTopUpAmountDollars(values);
  return Number.isFinite(amount) ? dollarsToUsdMicros(amount) : 0;
}

function selectedTopUpAmountDollars(values: FormValues): number {
  const customAmount = String(values.customAmount).trim();
  return customAmount ? Number(customAmount) : values.selectedPreset;
}
