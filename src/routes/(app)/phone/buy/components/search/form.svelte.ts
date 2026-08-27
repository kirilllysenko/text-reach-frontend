import { createForm, type FormSubmitResult } from "text-reach-frontend-library/form";
import { z } from "zod";

export const validator = z
  .object({
    phoneSearch: z.string(),
    tenDlcCampaignId: z.string(),
  })
  .transform((values) => ({
    number: values.phoneSearch.replace(/\D/g, "") || null,
    tenDlcCampaignId: values.tenDlcCampaignId.trim() || null,
  }));

export type FormValues = z.input<typeof validator>;
export type SubmitValues = z.output<typeof validator>;

export const initialValues: FormValues = {
  phoneSearch: "",
  tenDlcCampaignId: "",
};

export function createPhoneSearchForm(onSubmit: (values: SubmitValues) => Promise<FormSubmitResult>) {
  return createForm<FormValues, SubmitValues>(initialValues, validator, onSubmit);
}

export function toPhoneSearchSubmitValues(values: FormValues): SubmitValues {
  return validator.parse(values);
}

export type PhoneSearchForm = ReturnType<typeof createPhoneSearchForm>;
